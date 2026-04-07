/**
 * push-to-supabase.ts
 *
 * Pushes new indicator definitions and data to the existing Supabase database.
 * Used when adding EDGAR, IRENA, CAT, Net Zero Tracker data.
 *
 * Usage: npx tsx scripts/push-to-supabase.ts {action}
 *   - register-indicators: Add new indicator definitions
 *   - push-data {csv_path}: Push CSV data to country_data
 *
 * CSV format expected: ISO3,indicator_code,year,value,source
 */

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

// New indicators to register (follows existing pattern from CLAUDE.md)
const NEW_INDICATORS = [
  {
    source: 'EDGAR',
    code: 'EDGAR.GHG.TOTAL',
    name: 'Total GHG excl. LULUCF (EDGAR)',
    unit: 'MtCO2eq',
    category: 'emissions',
    domain: 'emissions',
  },
  {
    source: 'EDGAR',
    code: 'EDGAR.CO2.FOSSIL',
    name: 'CO2 fossil fuels and industry (EDGAR)',
    unit: 'MtCO2',
    category: 'emissions',
    domain: 'emissions',
  },
  {
    source: 'EDGAR',
    code: 'EDGAR.CH4.TOTAL',
    name: 'Total CH4 (EDGAR)',
    unit: 'MtCO2eq',
    category: 'emissions',
    domain: 'emissions',
  },
  {
    source: 'EDGAR',
    code: 'EDGAR.SECTOR.ENERGY',
    name: 'Energy sector share (EDGAR)',
    unit: '%',
    category: 'emissions',
    domain: 'emissions',
  },
  {
    source: 'EDGAR',
    code: 'EDGAR.SECTOR.INDUSTRY',
    name: 'Industry sector share (EDGAR)',
    unit: '%',
    category: 'emissions',
    domain: 'emissions',
  },
  {
    source: 'EDGAR',
    code: 'EDGAR.SECTOR.AGRICULTURE',
    name: 'Agriculture sector share (EDGAR)',
    unit: '%',
    category: 'emissions',
    domain: 'emissions',
  },
  {
    source: 'EDGAR',
    code: 'EDGAR.SECTOR.WASTE',
    name: 'Waste sector share (EDGAR)',
    unit: '%',
    category: 'emissions',
    domain: 'emissions',
  },
  {
    source: 'IRENA',
    code: 'IRENA.RE.CAPACITY',
    name: 'Renewable energy capacity',
    unit: 'GW',
    category: 'energy',
    domain: 'energy',
  },
  {
    source: 'IRENA',
    code: 'IRENA.RE.SHARE.ELEC',
    name: 'RE share of electricity generation',
    unit: '%',
    category: 'energy',
    domain: 'energy',
  },
  {
    source: 'CAT',
    code: 'CAT.RATING',
    name: 'Climate Action Tracker rating',
    unit: 'text',
    category: 'policy',
    domain: 'policy',
  },
  {
    source: 'NETZERO',
    code: 'NETZERO.YEAR',
    name: 'Net-zero target year',
    unit: 'year',
    category: 'policy',
    domain: 'policy',
  },
  {
    source: 'NETZERO',
    code: 'NETZERO.LEGAL',
    name: 'Net-zero legal status',
    unit: 'text',
    category: 'policy',
    domain: 'policy',
  },
  {
    source: 'NDC',
    code: 'NDC.3.SUBMITTED',
    name: 'NDC 3.0 submitted',
    unit: 'boolean',
    category: 'policy',
    domain: 'policy',
  },
  {
    source: 'NDC',
    code: 'NDC.2035.TARGET',
    name: 'NDC 2035 target reduction %',
    unit: '%',
    category: 'policy',
    domain: 'policy',
  },
];

async function registerIndicators() {
  console.log('Registering new indicators...');
  let success = 0;
  let failed = 0;

  for (const ind of NEW_INDICATORS) {
    const { error } = await supabase
      .from('indicators')
      .upsert(ind, { onConflict: 'code' });

    if (error) {
      console.error(`  FAIL ${ind.code}: ${error.message}`);
      failed++;
    } else {
      console.log(`  OK   ${ind.code}`);
      success++;
    }
  }

  console.log(`\nDone. Success: ${success}, Failed: ${failed}, Total: ${NEW_INDICATORS.length}`);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function pushData(csvPath: string) {
  const resolvedPath = path.resolve(csvPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  console.log(`Pushing data from ${resolvedPath}...`);

  const content = fs.readFileSync(resolvedPath, 'utf-8');
  const lines = content.trim().split('\n');

  if (lines.length < 2) {
    console.error('CSV file must have a header row and at least one data row.');
    process.exit(1);
  }

  const header = lines[0];
  console.log(`Header: ${header}`);
  console.log(`Data rows: ${lines.length - 1}`);

  // Validate header
  const expectedCols = ['ISO3', 'indicator_code', 'year', 'value', 'source'];
  const headerCols = parseCSVLine(header).map(h => h.replace(/"/g, ''));
  for (const col of expectedCols) {
    if (!headerCols.some(h => h.toLowerCase() === col.toLowerCase())) {
      console.error(`Missing required column: ${col}`);
      console.error(`Expected: ${expectedCols.join(',')}`);
      process.exit(1);
    }
  }

  // Parse data rows
  const dataRows = lines.slice(1).map(line => {
    const cols = parseCSVLine(line);
    return {
      country_iso3: cols[0].replace(/"/g, '').trim(),
      indicator_code: cols[1].replace(/"/g, '').trim(),
      year: parseInt(cols[2]),
      value: parseFloat(cols[3]),
      source: cols[4]?.replace(/"/g, '').trim() || null,
    };
  }).filter(r => !isNaN(r.value) && !isNaN(r.year) && r.country_iso3 && r.indicator_code);

  console.log(`Valid rows to push: ${dataRows.length}`);

  let success = 0;
  let failed = 0;
  const batchSize = 500;

  for (let i = 0; i < dataRows.length; i += batchSize) {
    const batch = dataRows.slice(i, i + batchSize);
    const { error } = await supabase
      .from('country_data')
      .upsert(batch, { onConflict: 'country_iso3,indicator_code,year' });

    if (error) {
      console.error(`  Batch ${i}-${i + batch.length} failed: ${error.message}`);
      failed += batch.length;
    } else {
      success += batch.length;
      console.log(`  Pushed ${Math.min(i + batchSize, dataRows.length)}/${dataRows.length}...`);
    }
  }

  console.log(`\nDone. Success: ${success}, Failed: ${failed}`);
}

async function showUsage() {
  console.log('VisualClimate Trojan — Push to Supabase');
  console.log('');
  console.log('Usage:');
  console.log('  npx tsx scripts/push-to-supabase.ts register-indicators');
  console.log('    Register new indicator definitions (EDGAR, IRENA, CAT, etc.)');
  console.log('');
  console.log('  npx tsx scripts/push-to-supabase.ts push-data {csv_path}');
  console.log('    Push CSV data to country_data table');
  console.log('    CSV format: ISO3,indicator_code,year,value,source');
}

// Main
async function main() {
  const action = process.argv[2];

  if (action === 'register-indicators') {
    await registerIndicators();
  } else if (action === 'push-data') {
    const csvPath = process.argv[3];
    if (!csvPath) {
      console.error('Error: CSV path required.');
      console.error('Usage: npx tsx scripts/push-to-supabase.ts push-data {csv_path}');
      process.exit(1);
    }
    await pushData(csvPath);
  } else {
    await showUsage();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
