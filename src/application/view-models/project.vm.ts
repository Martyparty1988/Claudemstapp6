/**
 * MST View Models - Project
 * 
 * View model pro zobrazení projektů v UI.
 * UI pracuje POUZE s těmito typy, nikdy přímo s domain entitami.
 */

import type { ProjectStatus, ProjectStatistics } from '../../domain';

/**
 * View model pro seznam projektů
 */
export interface ProjectListItemVM {
  readonly id: string;
  readonly name: string;
  readonly location: string | null;
  readonly status: ProjectStatus;
  readonly statusLabel: string;
  readonly completionPercentage: number;
  readonly totalTables: number;
  readonly completedTables: number;
  readonly totalKwp: string;
  readonly updatedAt: string;
  readonly isActive: boolean;
}

/**
 * View model pro detail projektu
 */
export interface ProjectDetailVM {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly location: string | null;
  readonly status: ProjectStatus;
  readonly statusLabel: string;
  readonly gridRows: number;
  readonly gridColumns: number;
  readonly statistics: ProjectStatisticsVM;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * View model pro statistiky projektu
 */
export interface ProjectStatisticsVM {
  readonly totalTables: number;
  readonly completedTables: number;
  readonly pendingTables: number;
  readonly inProgressTables: number;
  readonly skippedTables: number;
  readonly completionPercentage: number;
  readonly completionLabel: string;
  readonly totalStrings: number;
  readonly totalPanels: number;
  readonly totalKwp: string;
}

/**
 * View model pro vytvoření projektu
 */
export interface CreateProjectFormVM {
  readonly name: string;
  readonly description: string;
  readonly location: string;
  readonly gridRows: number;
  readonly gridColumns: number;
}

/**
 * Default hodnoty pro formulář
 */
export const DEFAULT_CREATE_PROJECT_FORM: CreateProjectFormVM = {
  name: '',
  description: '',
  location: '',
  gridRows: 10,
  gridColumns: 10,
};

/**
 * Mapování statusů na labely
 */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: 'Koncept',
  active: 'Aktivní',
  completed: 'Dokončeno',
  archived: 'Archivováno',
};

/**
 * Mapování statusů na barvy (identifikátory, ne CSS)
 */
export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: 'gray',
  active: 'blue',
  completed: 'green',
  archived: 'slate',
};
