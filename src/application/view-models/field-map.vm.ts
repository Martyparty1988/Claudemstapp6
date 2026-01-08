/**
 * MST View Models - FieldMap
 * 
 * View modely pro FieldMap (hlavní pracovní režim).
 * Obsahuje vše potřebné pro renderování mapy stolů.
 */

import type { WorkStatus, WorkType, TableSize } from '../../domain';

/**
 * View model pro jeden stůl v mřížce
 */
export interface TableCellVM {
  readonly id: string;
  readonly row: number;
  readonly column: number;
  readonly label: string;
  readonly size: TableSize;
  readonly sizeLabel: string;
  readonly status: WorkStatus;
  readonly statusColor: string;
  readonly isSelected: boolean;
  readonly isCompleted: boolean;
  readonly strings: number;
  readonly panels: number;
  readonly kwp: string;
}

/**
 * View model pro celou FieldMap
 */
export interface FieldMapVM {
  readonly projectId: string;
  readonly projectName: string;
  readonly rows: number;
  readonly columns: number;
  readonly tables: readonly TableCellVM[];
  readonly statistics: FieldMapStatisticsVM;
}

/**
 * View model pro statistiky v FieldMap
 */
export interface FieldMapStatisticsVM {
  readonly totalTables: number;
  readonly completedTables: number;
  readonly pendingTables: number;
  readonly completionPercentage: number;
  readonly completionLabel: string;
  readonly todayCompleted: number;
}

/**
 * View model pro selection state
 */
export interface FieldMapSelectionVM {
  readonly selectedIds: readonly string[];
  readonly selectedCount: number;
  readonly isMultiSelect: boolean;
  readonly canConfirm: boolean;
  readonly selectedTables: readonly TableCellVM[];
  readonly summary: SelectionSummaryVM;
}

/**
 * Souhrn vybraných stolů
 */
export interface SelectionSummaryVM {
  readonly tableCount: number;
  readonly totalStrings: number;
  readonly totalPanels: number;
  readonly totalKwp: string;
}

/**
 * View model pro bottom sheet (potvrzení práce)
 */
export interface WorkConfirmationSheetVM {
  readonly isOpen: boolean;
  readonly selectedTables: readonly TableCellVM[];
  readonly summary: SelectionSummaryVM;
  readonly workType: WorkType;
  readonly notes: string;
  readonly canSubmit: boolean;
}

/**
 * Default hodnoty pro work confirmation
 */
export const DEFAULT_WORK_CONFIRMATION: Omit<WorkConfirmationSheetVM, 'selectedTables' | 'summary'> = {
  isOpen: false,
  workType: 'installation',
  notes: '',
  canSubmit: false,
};

/**
 * Mapování statusů na barvy
 */
export const WORK_STATUS_COLORS: Record<WorkStatus, string> = {
  pending: 'bg-slate-200',
  in_progress: 'bg-amber-400',
  completed: 'bg-emerald-500',
  skipped: 'bg-slate-400',
};

/**
 * Mapování statusů na labely
 */
export const WORK_STATUS_LABELS: Record<WorkStatus, string> = {
  pending: 'Čeká',
  in_progress: 'Probíhá',
  completed: 'Hotovo',
  skipped: 'Přeskočeno',
};

/**
 * Mapování velikostí stolů na labely
 */
export const TABLE_SIZE_LABELS: Record<TableSize, string> = {
  large: 'Velký',
  medium: 'Střední',
  small: 'Malý',
};

/**
 * Mapování work type na labely
 */
export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  installation: 'Instalace',
  inspection: 'Kontrola',
  maintenance: 'Údržba',
  repair: 'Oprava',
};

/**
 * Empty selection state
 */
export const EMPTY_SELECTION: FieldMapSelectionVM = {
  selectedIds: [],
  selectedCount: 0,
  isMultiSelect: false,
  canConfirm: false,
  selectedTables: [],
  summary: {
    tableCount: 0,
    totalStrings: 0,
    totalPanels: 0,
    totalKwp: '0.00',
  },
};
