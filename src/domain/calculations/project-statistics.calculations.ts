/**
 * MST Domain Calculations - Project Statistics
 * 
 * Čistá business logika pro výpočty statistik projektu.
 */

import { WORK_STATUS, type WorkStatus } from '../constants';
import type {
  Project,
  ProjectStatistics,
  ProjectWithStatistics,
  TableWithWorkState,
} from '../types';
import { sumTableValues } from './table.calculations';

/**
 * Vypočítá statistiky projektu z dat stolů
 */
export function calculateProjectStatistics(
  tables: readonly TableWithWorkState[]
): ProjectStatistics {
  const totalTables = tables.length;

  const statusCounts = tables.reduce(
    (acc, table) => {
      const status = table.workState.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<WorkStatus, number>
  );

  const completedTables = statusCounts[WORK_STATUS.completed] || 0;
  const pendingTables = statusCounts[WORK_STATUS.pending] || 0;
  const inProgressTables = statusCounts[WORK_STATUS.inProgress] || 0;
  const skippedTables = statusCounts[WORK_STATUS.skipped] || 0;

  const tableValues = sumTableValues(tables);

  const completionPercentage =
    totalTables > 0
      ? Math.round((completedTables / totalTables) * 100)
      : 0;

  return {
    totalTables,
    completedTables,
    pendingTables,
    inProgressTables,
    skippedTables,
    totalStrings: tableValues.strings,
    totalPanels: tableValues.panels,
    totalKwp: tableValues.kwp,
    completionPercentage,
  };
}

/**
 * Rozšíří projekt o statistiky
 */
export function enrichProjectWithStatistics(
  project: Project,
  tables: readonly TableWithWorkState[]
): ProjectWithStatistics {
  return {
    ...project,
    statistics: calculateProjectStatistics(tables),
  };
}

/**
 * Vytvoří prázdné statistiky pro projekt bez stolů
 */
export function createEmptyStatistics(): ProjectStatistics {
  return {
    totalTables: 0,
    completedTables: 0,
    pendingTables: 0,
    inProgressTables: 0,
    skippedTables: 0,
    totalStrings: 0,
    totalPanels: 0,
    totalKwp: 0,
    completionPercentage: 0,
  };
}

/**
 * Vypočítá procentuální rozdíl mezi dvěma statistikami
 */
export function calculateStatisticsDiff(
  current: ProjectStatistics,
  previous: ProjectStatistics
): {
  readonly completionDiff: number;
  readonly tablesDiff: number;
  readonly kwpDiff: number;
} {
  return {
    completionDiff: current.completionPercentage - previous.completionPercentage,
    tablesDiff: current.completedTables - previous.completedTables,
    kwpDiff: current.totalKwp - previous.totalKwp,
  };
}
