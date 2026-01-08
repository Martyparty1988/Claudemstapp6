/**
 * MST Domain Types - Project
 * 
 * Definice typů pro projekty (solární elektrárny).
 */

/**
 * Status projektu
 */
export const PROJECT_STATUS = {
  draft: 'draft',
  active: 'active',
  completed: 'completed',
  archived: 'archived',
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

/**
 * Konfigurace mřížky projektu
 */
export interface ProjectGridConfig {
  readonly rows: number;
  readonly columns: number;
}

/**
 * Základní entita projektu
 */
export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly location?: string;
  readonly status: ProjectStatus;
  readonly gridConfig: ProjectGridConfig;
  readonly createdAt: number;
  readonly updatedAt: number;
}

/**
 * Statistiky projektu (vypočtené z domain logiky)
 */
export interface ProjectStatistics {
  readonly totalTables: number;
  readonly completedTables: number;
  readonly pendingTables: number;
  readonly inProgressTables: number;
  readonly skippedTables: number;
  readonly totalStrings: number;
  readonly totalPanels: number;
  readonly totalKwp: number;
  readonly completionPercentage: number;
}

/**
 * Projekt s vypočtenými statistikami
 */
export interface ProjectWithStatistics extends Project {
  readonly statistics: ProjectStatistics;
}

/**
 * DTO pro vytvoření projektu
 */
export interface CreateProjectDto {
  readonly name: string;
  readonly description?: string;
  readonly location?: string;
  readonly gridConfig: ProjectGridConfig;
}

/**
 * DTO pro update projektu
 */
export interface UpdateProjectDto {
  readonly name?: string;
  readonly description?: string;
  readonly location?: string;
  readonly status?: ProjectStatus;
  readonly gridConfig?: ProjectGridConfig;
}
