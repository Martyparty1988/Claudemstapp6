/**
 * MST View Models - Work Records
 * 
 * View modely pro pracovní záznamy a historii.
 */

import type { WorkStatus, WorkType } from '../../domain';
import { WORK_STATUS_LABELS, WORK_TYPE_LABELS } from './field-map.vm';

/**
 * View model pro jeden work record v seznamu
 */
export interface WorkRecordListItemVM {
  readonly id: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly workType: WorkType;
  readonly workTypeLabel: string;
  readonly status: WorkStatus;
  readonly statusLabel: string;
  readonly statusColor: string;
  readonly tableCount: number;
  readonly notes: string | null;
  readonly workerName: string | null;
  readonly startedAt: string;
  readonly startedAtRelative: string;
  readonly completedAt: string | null;
  readonly duration: string | null;
}

/**
 * View model pro detail work recordu
 */
export interface WorkRecordDetailVM {
  readonly id: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly workType: WorkType;
  readonly workTypeLabel: string;
  readonly status: WorkStatus;
  readonly statusLabel: string;
  readonly tableIds: readonly string[];
  readonly tableCount: number;
  readonly notes: string | null;
  readonly workerName: string | null;
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly createdAt: string;
}

/**
 * View model pro denní souhrn
 */
export interface DailyWorkSummaryVM {
  readonly date: string;
  readonly dateLabel: string;
  readonly isToday: boolean;
  readonly totalRecords: number;
  readonly completedTables: number;
  readonly totalStrings: number;
  readonly totalPanels: number;
  readonly totalKwp: string;
  readonly records: readonly WorkRecordListItemVM[];
}

/**
 * View model pro statistiky práce
 */
export interface WorkStatisticsVM {
  readonly totalRecords: number;
  readonly totalTablesCompleted: number;
  readonly totalKwp: string;
  readonly averageTablesPerDay: number;
  readonly averageKwpPerDay: string;
  readonly lastWorkAt: string | null;
}

/**
 * Seskupení work records podle data
 */
export interface GroupedWorkRecordsVM {
  readonly groups: readonly DailyWorkSummaryVM[];
  readonly totalRecords: number;
  readonly hasMore: boolean;
}

/**
 * Re-export labels pro použití v mapperech
 */
export { WORK_STATUS_LABELS, WORK_TYPE_LABELS };

/**
 * Mapování statusů na barvy pro work records
 */
export const WORK_RECORD_STATUS_COLORS: Record<WorkStatus, string> = {
  pending: 'text-slate-500',
  in_progress: 'text-amber-600',
  completed: 'text-emerald-600',
  skipped: 'text-slate-400',
};
