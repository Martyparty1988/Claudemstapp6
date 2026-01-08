/**
 * MST Mappers - Project
 * 
 * Transformace domain entit na view-modely.
 * UI NIKDY nepracuje přímo s domain entitami.
 */

import type {
  Project,
  ProjectWithStatistics,
  ProjectStatistics,
} from '../../domain';
import { formatKwp } from '../../domain';
import type {
  ProjectListItemVM,
  ProjectDetailVM,
  ProjectStatisticsVM,
} from '../view-models';
import { PROJECT_STATUS_LABELS } from '../view-models';

/**
 * Formátuje datum pro zobrazení
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Mapuje ProjectStatistics na ProjectStatisticsVM
 */
export function mapProjectStatistics(stats: ProjectStatistics): ProjectStatisticsVM {
  return {
    totalTables: stats.totalTables,
    completedTables: stats.completedTables,
    pendingTables: stats.pendingTables,
    inProgressTables: stats.inProgressTables,
    skippedTables: stats.skippedTables,
    completionPercentage: stats.completionPercentage,
    completionLabel: `${stats.completionPercentage}%`,
    totalStrings: stats.totalStrings,
    totalPanels: stats.totalPanels,
    totalKwp: formatKwp(stats.totalKwp),
  };
}

/**
 * Mapuje Project na ProjectListItemVM
 */
export function mapProjectToListItem(
  project: Project,
  statistics?: ProjectStatistics
): ProjectListItemVM {
  const stats = statistics ?? {
    totalTables: 0,
    completedTables: 0,
    completionPercentage: 0,
    totalKwp: 0,
  };

  return {
    id: project.id,
    name: project.name,
    location: project.location ?? null,
    status: project.status,
    statusLabel: PROJECT_STATUS_LABELS[project.status],
    completionPercentage: stats.completionPercentage,
    totalTables: stats.totalTables,
    completedTables: stats.completedTables,
    totalKwp: formatKwp(stats.totalKwp),
    updatedAt: formatDate(project.updatedAt),
    isActive: project.status === 'active',
  };
}

/**
 * Mapuje ProjectWithStatistics na ProjectListItemVM
 */
export function mapProjectWithStatsToListItem(
  project: ProjectWithStatistics
): ProjectListItemVM {
  return mapProjectToListItem(project, project.statistics);
}

/**
 * Mapuje Project na ProjectDetailVM
 */
export function mapProjectToDetail(
  project: Project,
  statistics?: ProjectStatistics
): ProjectDetailVM {
  const stats = statistics ?? {
    totalTables: 0,
    completedTables: 0,
    pendingTables: 0,
    inProgressTables: 0,
    skippedTables: 0,
    completionPercentage: 0,
    totalStrings: 0,
    totalPanels: 0,
    totalKwp: 0,
  };

  return {
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    location: project.location ?? null,
    status: project.status,
    statusLabel: PROJECT_STATUS_LABELS[project.status],
    gridRows: project.gridConfig.rows,
    gridColumns: project.gridConfig.columns,
    statistics: mapProjectStatistics(stats),
    createdAt: formatDateTime(project.createdAt),
    updatedAt: formatDateTime(project.updatedAt),
  };
}

/**
 * Mapuje pole projektů na list items
 */
export function mapProjectsToListItems(
  projects: readonly Project[],
  statisticsMap?: Map<string, ProjectStatistics>
): readonly ProjectListItemVM[] {
  return projects.map((project) =>
    mapProjectToListItem(project, statisticsMap?.get(project.id))
  );
}
