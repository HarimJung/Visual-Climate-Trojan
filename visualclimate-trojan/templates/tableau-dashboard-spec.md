# Tableau Dashboard Spec: {DASHBOARD_NAME}

**Generated**: {TODAY_DATE}
**For**: Harim (Tableau Desktop)

---

## 1. Dashboard Purpose
{What the dashboard should allow a user to understand or compare.}

## 2. Source Report
- Report path: {REPORT_PATH}
- Report type: {REPORT_TYPE}
- Primary grain: {country-level / country-year / country-indicator-year}

## 3. Data Sources
| # | Source Name | File Path | Grain | Notes |
|---|-------------|-----------|-------|-------|

## 4. Relationships / Joins
| Left Source | Right Source | Key | Relationship Type | Notes |
|-------------|--------------|-----|-------------------|-------|

## 5. Required Dimensions and Measures
### Dimensions
- {dimension list}

### Measures
- {measure list}

## 6. Calculated Fields
| # | Name | Tableau Formula | Return Type | Purpose |
|---|------|-----------------|-------------|---------|

## 7. LOD Expressions
| # | Name | Tableau Formula | Purpose |
|---|------|-----------------|---------|

## 8. Sheet Inventory
| # | Sheet Name | Purpose | Data Source |
|---|------------|---------|-------------|

## 9. Detailed Sheet Instructions

### Sheet: {NAME}
- Goal:
- Mark type:
- Rows:
- Columns:
- Filters:
- Parameters:
- Color:
- Size:
- Label:
- Tooltip:
- Sort:
- Reference line / band:
- Null-handling:
- Notes:

## 10. Dashboard Assembly
- Layout structure:
- Container logic:
- User reading order:
- State logic:
- Warning panel behavior:

## 11. Filters, Parameters, and Actions
- Global filters:
- Parameters:
- Filter actions:
- Highlight actions:
- URL actions:

## 12. Reusability Notes
- How the same dashboard supports additional countries or country sets
- What must remain fixed
- What can change safely

## 13. Build Checklist
- [ ] Data sources connected
- [ ] Calculated fields created
- [ ] LOD expressions created
- [ ] Sheets built
- [ ] Tooltips validated
- [ ] Filters and actions validated
- [ ] Country switching works
- [ ] Warnings display correctly
