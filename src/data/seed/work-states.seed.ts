/**
 * MST Seed Data - Table Work States
 * 
 * Demo stavy práce na stolech.
 * Používá domain typy TableWorkState.
 */

import type { TableWorkState } from '../../domain/types';
import type { WorkStatus } from '../../domain/constants';
import { SEED_PROJECTS } from './projects.seed';
import { getSeedTablesForProject } from './tables.seed';

/**
 * Generovat work states pro projekt
 */
export function generateWorkStatesForProject(projectId: string): TableWorkState[] {
  const project = SEED_PROJECTS.find((p) => p.id === projectId);
  if (!project) return [];

  const tables = getSeedTablesForProject(projectId);
  const workStates: TableWorkState[] = [];
  const completedCount = project.statistics.completedTables;

  tables.forEach((table, index) => {
    let status: WorkStatus = 'pending';
    let completedAt: number | undefined;
    let lastWorkRecordId: string | undefined;

    if (index < completedCount) {
      // Dokončené stoly
      status = 'completed';
      completedAt = Date.now() - (completedCount - index) * 3600000; // Postupně v čase
      lastWorkRecordId = `wr-${projectId}-${index}`;
    } else if (index < completedCount + 3 && project.status === 'active') {
      // Pár stolů "in progress" pro aktivní projekty
      status = 'in_progress';
    }

    const workState: TableWorkState = {
      tableId: table.id,
      status,
      completedAt,
      lastWorkRecordId,
    };

    workStates.push(workState);
  });

  return workStates;
}

/**
 * Seed work states pro všechny projekty
 */
export function generateAllSeedWorkStates(): Map<string, TableWorkState[]> {
  const result = new Map<string, TableWorkState[]>();

  for (const project of SEED_PROJECTS) {
    const workStates = generateWorkStatesForProject(project.id);
    result.set(project.id, workStates);
  }

  return result;
}

/**
 * Pre-generované work states
 */
export const SEED_WORK_STATES = generateAllSeedWorkStates();
