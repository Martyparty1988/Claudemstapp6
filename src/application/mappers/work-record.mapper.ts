/**
 * MST Mappers - Work Record
 * 
 * Transformace work record entit na view-modely.
 */

import type { WorkRecord, DailyWorkSummary } from '../../domain';
import { formatKwp, groupWorkRecordsByDate, formatDateKey } from '../../domain';
import type {
  WorkRecordListItemVM,
  WorkRecordDetailVM,
  DailyWorkSummaryVM,
  GroupedWorkRecordsVM,
  WorkStatisticsVM,
} from '../view-models';
import {
  WORK_STATUS_LABELS,
  WORK_TYPE_LABELS,
  WORK_RECORD_STATUS_COLORS,
} from '../view-models';

/**
 * Formátuje datum
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formátuje datum a čas
 */
function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formátuje relativní čas
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'právě teď';
  if (minutes < 60) return `před ${minutes} min`;
  if (hours < 24) return `před ${hours} h`;
  if (days < 7) return `před ${days} dny`;

  return formatDate(timestamp);
}

/**
 * Formátuje délku trvání
 */
function formatDuration(startedAt: number, completedAt: number): string {
  const diff = completedAt - startedAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Kontroluje, zda je datum dnes
 */
function isToday(dateString: string): boolean {
  const today = formatDateKey(Date.now());
  return dateString === today;
}

/**
 * Formátuje date key na label
 */
function formatDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateString === formatDateKey(today.getTime())) {
    return 'Dnes';
  }
  if (dateString === formatDateKey(yesterday.getTime())) {
    return 'Včera';
  }

  return date.toLocaleDateString('cs-CZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Mapuje WorkRecord na WorkRecordListItemVM
 */
export function mapWorkRecordToListItem(
  record: WorkRecord,
  projectName: string = 'Projekt'
): WorkRecordListItemVM {
  return {
    id: record.id,
    projectId: record.projectId,
    projectName,
    workType: record.workType,
    workTypeLabel: WORK_TYPE_LABELS[record.workType],
    status: record.status,
    statusLabel: WORK_STATUS_LABELS[record.status],
    statusColor: WORK_RECORD_STATUS_COLORS[record.status],
    tableCount: record.tableIds.length,
    notes: record.notes ?? null,
    workerName: record.workerName ?? null,
    startedAt: formatDateTime(record.startedAt),
    startedAtRelative: formatRelativeTime(record.startedAt),
    completedAt: record.completedAt ? formatDateTime(record.completedAt) : null,
    duration:
      record.completedAt
        ? formatDuration(record.startedAt, record.completedAt)
        : null,
  };
}

/**
 * Mapuje WorkRecord na WorkRecordDetailVM
 */
export function mapWorkRecordToDetail(
  record: WorkRecord,
  projectName: string = 'Projekt'
): WorkRecordDetailVM {
  return {
    id: record.id,
    projectId: record.projectId,
    projectName,
    workType: record.workType,
    workTypeLabel: WORK_TYPE_LABELS[record.workType],
    status: record.status,
    statusLabel: WORK_STATUS_LABELS[record.status],
    tableIds: record.tableIds,
    tableCount: record.tableIds.length,
    notes: record.notes ?? null,
    workerName: record.workerName ?? null,
    startedAt: formatDateTime(record.startedAt),
    completedAt: record.completedAt ? formatDateTime(record.completedAt) : null,
    createdAt: formatDateTime(record.createdAt),
  };
}

/**
 * Mapuje pole work records na list items
 */
export function mapWorkRecordsToListItems(
  records: readonly WorkRecord[],
  projectNamesMap?: Map<string, string>
): readonly WorkRecordListItemVM[] {
  return records.map((record) =>
    mapWorkRecordToListItem(
      record,
      projectNamesMap?.get(record.projectId) ?? 'Projekt'
    )
  );
}

/**
 * Mapuje DailyWorkSummary na DailyWorkSummaryVM
 */
export function mapDailyWorkSummary(
  summary: DailyWorkSummary,
  records: readonly WorkRecord[],
  projectName: string = 'Projekt'
): DailyWorkSummaryVM {
  return {
    date: summary.date,
    dateLabel: formatDateLabel(summary.date),
    isToday: isToday(summary.date),
    totalRecords: summary.totalRecords,
    completedTables: summary.completedTables,
    totalStrings: summary.totalStrings,
    totalPanels: summary.totalPanels,
    totalKwp: formatKwp(summary.totalKwp),
    records: mapWorkRecordsToListItems(records, new Map([[summary.projectId, projectName]])),
  };
}

/**
 * Seskupí work records podle data a mapuje na view-modely
 */
export function mapToGroupedWorkRecords(
  records: readonly WorkRecord[],
  projectNamesMap?: Map<string, string>,
  hasMore: boolean = false
): GroupedWorkRecordsVM {
  const grouped = groupWorkRecordsByDate(records);
  const groups: DailyWorkSummaryVM[] = [];

  // Seřadíme datumy (nejnovější první)
  const sortedDates = Array.from(grouped.keys()).sort().reverse();

  for (const date of sortedDates) {
    const dayRecords = grouped.get(date) ?? [];

    // Spočítáme souhrn
    let completedTables = 0;
    for (const record of dayRecords) {
      completedTables += record.tableIds.length;
    }

    groups.push({
      date,
      dateLabel: formatDateLabel(date),
      isToday: isToday(date),
      totalRecords: dayRecords.length,
      completedTables,
      totalStrings: 0, // Tyto hodnoty bychom museli spočítat z tables
      totalPanels: 0,
      totalKwp: '0.00',
      records: dayRecords.map((r) =>
        mapWorkRecordToListItem(r, projectNamesMap?.get(r.projectId))
      ),
    });
  }

  return {
    groups,
    totalRecords: records.length,
    hasMore,
  };
}

/**
 * Vypočítá statistiky práce
 */
export function calculateWorkStatistics(
  records: readonly WorkRecord[]
): WorkStatisticsVM {
  if (records.length === 0) {
    return {
      totalRecords: 0,
      totalTablesCompleted: 0,
      totalKwp: '0.00',
      averageTablesPerDay: 0,
      averageKwpPerDay: '0.00',
      lastWorkAt: null,
    };
  }

  let totalTables = 0;
  for (const record of records) {
    totalTables += record.tableIds.length;
  }

  // Počet unikátních dnů
  const uniqueDays = new Set(
    records.map((r) => formatDateKey(r.startedAt))
  ).size;

  // Nejnovější záznam
  const lastRecord = [...records].sort((a, b) => b.startedAt - a.startedAt)[0];

  return {
    totalRecords: records.length,
    totalTablesCompleted: totalTables,
    totalKwp: '0.00', // Museli bychom spočítat z tables
    averageTablesPerDay: uniqueDays > 0 ? Math.round(totalTables / uniqueDays) : 0,
    averageKwpPerDay: '0.00',
    lastWorkAt: lastRecord ? formatRelativeTime(lastRecord.startedAt) : null,
  };
}
