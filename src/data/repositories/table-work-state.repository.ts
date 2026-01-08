/**
 * MST Table Work State Repository
 * 
 * Data access layer pro stavy práce na stolech.
 * Odděleno od table repository pro lepší performance při častých updatech.
 */

import { getDatabase } from '../database';
import {
  type RepositoryError,
  databaseError,
  notFoundError,
} from './base.repository';
import type { TableWorkState, WorkStatus, Result } from '../../domain';
import {
  createDefaultWorkState,
  createCompletedWorkState,
  WORK_STATUS,
  success,
  failure,
} from '../../domain';

/**
 * Table Work State Repository
 */
class TableWorkStateRepositoryImpl {
  private get table() {
    return getDatabase().tableWorkStates;
  }

  /**
   * Získá work state podle table ID
   */
  async getByTableId(
    tableId: string
  ): Promise<Result<TableWorkState, RepositoryError>> {
    try {
      const state = await this.table.get(tableId);

      if (!state) {
        // Pokud neexistuje, vrátíme default
        return success(createDefaultWorkState(tableId));
      }

      return success(state);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá work states pro více stolů
   */
  async getByTableIds(
    tableIds: readonly string[]
  ): Promise<Result<ReadonlyMap<string, TableWorkState>, RepositoryError>> {
    try {
      const states = await this.table
        .where('tableId')
        .anyOf([...tableIds])
        .toArray();

      const stateMap = new Map<string, TableWorkState>();

      // Nejdřív přidáme default pro všechny
      for (const id of tableIds) {
        stateMap.set(id, createDefaultWorkState(id));
      }

      // Přepíšeme těmi co existují
      for (const state of states) {
        stateMap.set(state.tableId, state);
      }

      return success(stateMap);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Aktualizuje status stolu
   */
  async updateStatus(
    tableId: string,
    status: WorkStatus,
    workRecordId?: string
  ): Promise<Result<TableWorkState, RepositoryError>> {
    try {
      const newState: TableWorkState = {
        tableId,
        status,
        lastWorkRecordId: workRecordId,
        completedAt: status === WORK_STATUS.completed ? Date.now() : undefined,
      };

      await this.table.put(newState);
      return success(newState);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Označí stoly jako dokončené
   */
  async markAsCompleted(
    tableIds: readonly string[],
    workRecordId: string
  ): Promise<Result<void, RepositoryError>> {
    try {
      const states: TableWorkState[] = tableIds.map((tableId) =>
        createCompletedWorkState(tableId, workRecordId)
      );

      await this.table.bulkPut(states);
      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Resetuje stoly na pending
   */
  async resetToPending(
    tableIds: readonly string[]
  ): Promise<Result<void, RepositoryError>> {
    try {
      const states: TableWorkState[] = tableIds.map((tableId) =>
        createDefaultWorkState(tableId)
      );

      await this.table.bulkPut(states);
      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá stoly podle statusu v projektu
   */
  async getTableIdsByStatus(
    projectId: string,
    status: WorkStatus
  ): Promise<Result<readonly string[], RepositoryError>> {
    try {
      const db = getDatabase();

      // Nejdřív získáme table IDs projektu
      const tables = await db.solarTables
        .where('projectId')
        .equals(projectId)
        .toArray();

      const projectTableIds = new Set(tables.map((t) => t.id));

      // Pak filtrujeme work states
      const states = await this.table
        .where('status')
        .equals(status)
        .filter((s) => projectTableIds.has(s.tableId))
        .toArray();

      return success(states.map((s) => s.tableId));
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Počet stolů podle statusu v projektu
   */
  async countByStatus(
    projectId: string
  ): Promise<
    Result<Record<WorkStatus, number>, RepositoryError>
  > {
    try {
      const db = getDatabase();

      const tables = await db.solarTables
        .where('projectId')
        .equals(projectId)
        .toArray();

      const tableIds = new Set(tables.map((t) => t.id));

      const states = await this.table
        .where('tableId')
        .anyOf([...tableIds] as string[])
        .toArray();

      // Inicializace počtů
      const counts: Record<WorkStatus, number> = {
        [WORK_STATUS.pending]: 0,
        [WORK_STATUS.inProgress]: 0,
        [WORK_STATUS.completed]: 0,
        [WORK_STATUS.skipped]: 0,
      };

      // Stoly bez work state jsou pending
      const stateMap = new Map(states.map((s) => [s.tableId, s]));

      for (const tableId of tableIds) {
        const state = stateMap.get(tableId as string);
        const status = state?.status ?? WORK_STATUS.pending;
        counts[status]++;
      }

      return success(counts);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Smaže work states pro stoly
   */
  async deleteByTableIds(
    tableIds: readonly string[]
  ): Promise<Result<void, RepositoryError>> {
    try {
      await this.table.bulkDelete([...tableIds]);
      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }
}

/**
 * Singleton instance
 */
let instance: TableWorkStateRepositoryImpl | null = null;

/**
 * Získá instanci repository
 */
export function getTableWorkStateRepository(): TableWorkStateRepositoryImpl {
  if (!instance) {
    instance = new TableWorkStateRepositoryImpl();
  }
  return instance;
}

/**
 * Export typu
 */
export type TableWorkStateRepository = TableWorkStateRepositoryImpl;
