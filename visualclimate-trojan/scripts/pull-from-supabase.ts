/**
 * pull-from-supabase.ts
 *
 * Pulls data from the existing VisualClimate Supabase database
 * and writes it to local data/ files for the Trojan engine.
 *
 * Usage: npx tsx scripts/pull-from-supabase.ts [ISO3]
 *   - No args: pulls all 250 countries (latest values only)
 *   - With ISO3: pulls single country (full timeseries)
 *
 * Output:
 *   - data/tableau/countries_latest.csv (all countries, latest year per indicator)
 *   - data/tableau/timeseries.csv (if ISO3 specified, full timeseries)
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment.');
  console.error('Copy .env.example to .env and fill in your credentials.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------------------------------------------------
// Indicator mapping: CSV field → list of DB codes to try (first match wins)
//
// Verified against actual country_data contents 2026-04-07.
// Previous mapping used nonexistent "WB.*" prefixed codes; the real DB stores
// World Bank codes without a prefix (e.g. SP.POP.TOTL, not WB.SP.POP.TOTL).
// ---------------------------------------------------------------------------
interface CodeOption {
  code: string;
  /** Divide raw value by this factor (e.g. 1000 to convert kt → Mt) */
  divisor?: number;
}

const FIELD_MAP: Record<string, CodeOption[]> = {
  population: [
    { code: 'SP.POP.TOTL' },
  ],
  gdp_per_capita: [
    { code: 'NY.GDP.PCAP.CD' },
  ],
  total_ghg: [
    // OWID values already in MtCO2e
    { code: 'OWID.TOTAL_GHG_EXCLUDING_LUCF' },
    { code: 'OWID.TOTAL_GHG' },
    // WB value in kt CO2e → convert to Mt
    { code: 'EN.ATM.GHGT.KT.CE', divisor: 1000 },
  ],
  co2_fossil: [
    { code: 'OWID.CO2' },            // Mt CO2
  ],
  ghg_per_capita: [
    { code: 'OWID.GHG_PER_CAPITA' }, // tCO2e/person
    { code: 'EN.GHG.CO2.PC.CE.AR5' },
  ],
  re_share_elec: [
    { code: 'EMBER.RENEWABLE.PCT' }, // % of total generation
    { code: 'EG.FEC.RNEW.ZS' },     // % of total final energy
  ],
  ndgain_vuln: [
    { code: 'NDGAIN.VULNERABILITY' },
  ],
  ndgain_ready: [
    { code: 'NDGAIN.READINESS' },
  ],
  // Kept for completeness — used in timeseries / future reports
  ctrace_total: [
    { code: 'CTRACE.TOTAL' },
  ],
  ctrace_power: [
    { code: 'CTRACE.POWER' },
  ],
  ctrace_transportation: [
    { code: 'CTRACE.TRANSPORTATION' },
  ],
  ctrace_manufacturing: [
    { code: 'CTRACE.MANUFACTURING' },
  ],
  ctrace_agriculture: [
    { code: 'CTRACE.AGRICULTURE' },
  ],
  ctrace_waste: [
    { code: 'CTRACE.WASTE' },
  ],
  ember_carbon_intensity: [
    { code: 'EMBER.CARBON.INTENSITY' },
  ],
};

/** Flatten all codes we need to query from Supabase */
function allIndicatorCodes(): string[] {
  const codes = new Set<string>();
  for (const options of Object.values(FIELD_MAP)) {
    for (const opt of options) {
      codes.add(opt.code);
    }
  }
  return Array.from(codes);
}

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

async function pullCountriesLatest() {
  console.log('Pulling latest values for all countries...');

  const { data: countries, error: countryErr } = await supabase
    .from('countries')
    .select('iso3, name, region, income_group, population');

  if (countryErr) {
    console.error('Error fetching countries:', countryErr.message);
    process.exit(1);
  }
  if (!countries || countries.length === 0) {
    console.error('No countries found in Supabase.');
    process.exit(1);
  }

  console.log(`Found ${countries.length} countries. Fetching indicators...`);

  const indicatorCodes = allIndicatorCodes();

  const header = [
    'ISO3', 'country_name', 'region', 'income_group',
    'population', 'gdp_ppp',
    'total_ghg', 'co2_fossil', 'ghg_per_capita', 're_share_elec',
    'ndgain_rank', 'ndgain_vuln', 'ndgain_ready',
    'data_year', 'source_primary',
  ].join(',');
  const rows: string[] = [header];

  let processed = 0;
  let populated = 0;

  for (const country of countries) {
    // Query all relevant indicators for this country, newest first
    const { data: latestData } = await supabase
      .from('country_data')
      .select('indicator_code, year, value, source')
      .eq('country_iso3', country.iso3)
      .in('indicator_code', indicatorCodes)
      .order('year', { ascending: false })
      .limit(500);

    // Build lookup: indicator_code → latest row (first occurrence = newest year)
    const latest: Record<string, { value: number; year: number; source: string }> = {};
    if (latestData) {
      for (const row of latestData) {
        if (!latest[row.indicator_code]) {
          latest[row.indicator_code] = {
            value: row.value,
            year: row.year,
            source: row.source,
          };
        }
      }
    }

    /**
     * Resolve a field: try each code option in order, return the first that
     * has data. Apply divisor if specified.
     */
    const resolve = (field: string): string => {
      const options = FIELD_MAP[field];
      if (!options) return '';
      for (const opt of options) {
        const d = latest[opt.code];
        if (d != null) {
          const val = opt.divisor ? d.value / opt.divisor : d.value;
          return String(val);
        }
      }
      return '';
    };

    const getMaxYear = (): string => {
      const years = Object.values(latest).map(d => d.year);
      return years.length > 0 ? String(Math.max(...years)) : '';
    };

    // --- Resolve each CSV column ---
    const pop = resolve('population');
    const gdpPerCapita = resolve('gdp_per_capita');
    const totalGhg = resolve('total_ghg');
    const co2Fossil = resolve('co2_fossil');
    const ghgPerCapita = resolve('ghg_per_capita');
    const reShareElec = resolve('re_share_elec');
    const ndgainVuln = resolve('ndgain_vuln');
    const ndgainReady = resolve('ndgain_ready');

    // Derived: gdp_ppp (total GDP) = gdp_per_capita × population
    // Falls back to countries.population if SP.POP.TOTL is missing
    const popNum = Number(pop) || country.population || 0;
    const gdpPpp = gdpPerCapita && popNum > 0
      ? String(Math.round(Number(gdpPerCapita) * popNum))
      : '';

    // Use countries.population as fallback if SP.POP.TOTL is missing
    const finalPop = pop || (country.population ? String(country.population) : '');

    // ndgain_rank: not stored in DB; leave blank
    const ndgainRank = '';

    const hasAnyData = totalGhg || co2Fossil || ghgPerCapita || finalPop || gdpPpp
      || reShareElec || ndgainVuln || ndgainReady;

    const row = [
      country.iso3,
      escapeCSV(country.name),
      escapeCSV(country.region || ''),
      escapeCSV(country.income_group || ''),
      finalPop,
      gdpPpp,
      totalGhg,
      co2Fossil,
      ghgPerCapita,
      reShareElec,
      ndgainRank,
      ndgainVuln,
      ndgainReady,
      getMaxYear() || '2024',
      'Supabase',
    ].join(',');
    rows.push(row);

    if (hasAnyData) populated++;

    processed++;
    if (processed % 50 === 0) {
      console.log(`  Processed ${processed}/${countries.length} countries...`);
    }
  }

  const outPath = path.resolve(__dirname, '..', 'data', 'tableau', 'countries_latest.csv');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, rows.join('\n'), 'utf-8');
  console.log(`\nWritten ${rows.length - 1} countries to ${outPath}`);
  console.log(`  ${populated} countries have at least one data column populated.`);
}

async function pullTimeseries(iso3: string) {
  console.log(`Pulling full timeseries for ${iso3}...`);

  const { data: country } = await supabase
    .from('countries')
    .select('name')
    .eq('iso3', iso3)
    .single();

  if (!country) {
    console.error(`Country ${iso3} not found in Supabase.`);
    process.exit(1);
  }

  const { data: tsData, error: tsErr } = await supabase
    .from('country_data')
    .select('indicator_code, year, value, source')
    .eq('country_iso3', iso3)
    .order('year', { ascending: true });

  if (tsErr) {
    console.error('Error fetching timeseries:', tsErr.message);
    process.exit(1);
  }
  if (!tsData || tsData.length === 0) {
    console.error(`No timeseries data found for ${iso3}.`);
    process.exit(1);
  }

  // Load indicator metadata for units
  const { data: indicators } = await supabase
    .from('indicators')
    .select('code, unit');

  const unitMap: Record<string, string> = {};
  if (indicators) {
    for (const ind of indicators) {
      unitMap[ind.code] = ind.unit || '';
    }
  }

  const rows: string[] = ['ISO3,country_name,year,indicator_code,value,unit,source'];
  for (const row of tsData) {
    rows.push([
      iso3,
      escapeCSV(country.name),
      String(row.year),
      row.indicator_code,
      String(row.value),
      escapeCSV(unitMap[row.indicator_code] || ''),
      escapeCSV(row.source || ''),
    ].join(','));
  }

  const outPath = path.resolve(__dirname, '..', 'data', 'tableau', 'timeseries.csv');
  fs.writeFileSync(outPath, rows.join('\n'), 'utf-8');
  console.log(`Written ${rows.length - 1} rows for ${iso3} to ${outPath}`);
}

// Main
async function main() {
  const iso3Arg = process.argv[2];
  if (iso3Arg) {
    await pullTimeseries(iso3Arg.toUpperCase());
  } else {
    await pullCountriesLatest();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
