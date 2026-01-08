/**
 * MST Domain Calculations - Work Record
 * 
 * Čistá business logika pro výpočty pracovních záznamů.
 */

import type {
  WorkRecord,
  DailyWorkSummary,
  TableWithCalculations,
  TimeRange,
} from '../types';
import { sumTableValues } from './table.calculations';

/**
 * Seskupí pracovní záznamy podle data
 */
export function groupWorkRecordsByDate(
  records: readonly WorkRecord[]
): Map<string, readonly WorkRecord[]> {
  const grouped = new Map<string, WorkRecord[]>();

  for (const record of records) {
    const date = formatDateKey(record.startedAt);
    const existing = grouped.get(date) || [];
    grouped.set(date, [...existing, record]);
  }

  return grouped;
}

/**
 * Formátuje timestamp na ISO date string
 */
export function formatDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

/**
 * Vytvoří denní souhrn práce
 */
export function calculateDailyWorkSummary(
  date: string,
  projectId: string,
  records: readonly WorkRecord[],
  tablesMap: ReadonlyMap<string, TableWithCalculations>
): DailyWorkSummary {
  // Získáme unikátní table IDs z všech záznamů
  const completedTableIds = new Set<string>();
  for (const record of records) {
    for (const tableId of record.tableIds) {
      completedTableIds.add(tableId);
    }
  }

  // Získáme stoly pro výpočty
  const completedTables: TableWithCalculations[] = [];
  for (const tableId of completedTableIds) {
    const table = tablesMap.get(tableId);
    if (table) {
      completedTables.push(table);
    }
  }

  const tableValues = sumTableValues(completedTables);

  return {
    date,
    projectId,
    totalRecords: records.length,
    completedTables: completedTables.length,
    totalStrings: tableValues.strings,
    totalPanels: tableValues.panels,
    totalKwp: tableValues.kwp,
  };
}

/**
 * Filtruje záznamy podle časového rozmezí
 */
export function filterRecordsByTimeRange(
  records: readonly WorkRecord[],
  timeRange: TimeRange
): readonly WorkRecord[] {
  return records.filter(
    (record) =>
      record.startedAt >= timeRange.from && record.startedAt <= timeRange.to
  );
}

/**
 * Vypočítá průměrnou denní produktivitu
 */
export function calculateAverageDailyProductivity(
  summaries: readonly DailyWorkSummary[]
): {
  readonly avgTables: number;
  readonly avgKwp: number;
  readonly avgRecords: number;
} {
  if (summaries.length === 0) {
    return { avgTables: 0, avgKwp: 0, avgRecords: 0 };
  }

  const totals = summaries.reduce(
    (acc, summary) => ({
      tables: acc.tables + summary.completedTables,
      kwp: acc.kwp + summary.totalKwp,
      records: acc.records + summary.totalRecords,
    }),
    { tables: 0, kwp: 0, records: 0 }
  );

  return {
    avgTables: Math.round(totals.tables / summaries.length),
    avgKwp: Math.round((totals.kwp / summaries.length) * 100) / 100,
    avgRecords: Math.round(totals.records / summaries.length),
  };
}

/**
 * Seřadí záznamy podle data (nejnovější první)
 */
export function sortRecordsByDate(
  records: readonly WorkRecord[],
  ascending: boolean = false
): readonly WorkRecord[] {
  const sorted = [...records].sort((a, b) => b.startedAt - a.startedAt);
  return ascending ? sorted.reverse() : sorted;
}
