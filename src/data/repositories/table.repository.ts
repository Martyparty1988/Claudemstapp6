/**
 * MST Table Repository
 * 
 * Data access layer pro stoly.
 * Jediný přístupový bod k table datům v databázi.
 */

import { getDatabase } from '../database';
import {
  BaseRepository,
  type RepositoryError,
  databaseError,
  notFoundError,
} from './base.repository';
import type {
  Table,
  TableWorkState,
  TableWithCalculations,
  TableWithWorkState,
  TablePosition,
  CreateTableDto,
  UpdateTableDto,
  Result,
} from '../../domain';
import {
  createTable,
  createDefaultWorkState,
  enrichTableWithCalculations,
  enrichTableWithWorkState,
  validateCreateTableDto,
  validateUpdateTableDto,
  success,
  failure,
} from '../../domain';

/**
 * Table Repository
 */
class TableRepositoryImpl extends BaseRepository<Table> {
  constructor() {
    super(getDatabase().solarTables, 'Table');
  }

  /**
   * Vytvoří nový stůl s validací
   */
  async createTable(
    dto: CreateTableDto
  ): Promise<Result<Table, RepositoryError>> {
    const validationResult = validateCreateTableDto(dto);
    if (!validationResult.success) {
      return failure({
        code: 'VALIDATION_ERROR',
        message: validationResult.error.message,
      });
    }

    const table = createTable(validationResult.data);

    // Vytvoříme i default work state
    const db = getDatabase();
    try {
      await db.transaction('rw', [db.solarTables, db.tableWorkStates], async () => {
        await db.solarTables.add(table);
        await db.tableWorkStates.add(createDefaultWorkState(table.id));
      });

      return success(table);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Vytvoří více stolů najednou (pro inicializaci gridu)
   */
  async createTables(
    dtos: readonly CreateTableDto[]
  ): Promise<Result<readonly Table[], RepositoryError>> {
    const tables: Table[] = [];
    const workStates: TableWorkState[] = [];

    for (const dto of dtos) {
      const validationResult = validateCreateTableDto(dto);
      if (!validationResult.success) {
        return failure({
          code: 'VALIDATION_ERROR',
          message: validationResult.error.message,
        });
      }

      const table = createTable(validationResult.data);
      tables.push(table);
      workStates.push(createDefaultWorkState(table.id));
    }

    const db = getDatabase();
    try {
      await db.transaction('rw', [db.solarTables, db.tableWorkStates], async () => {
        await db.solarTables.bulkAdd(tables);
        await db.tableWorkStates.bulkAdd(workStates);
      });

      return success(tables);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Aktualizuje stůl
   */
  async updateTable(
    id: string,
    dto: UpdateTableDto
  ): Promise<Result<Table, RepositoryError>> {
    const validationResult = validateUpdateTableDto(dto);
    if (!validationResult.success) {
      return failure({
        code: 'VALIDATION_ERROR',
        message: validationResult.error.message,
      });
    }

    return this.update(id, {
      ...validationResult.data,
      updatedAt: Date.now(),
    } as Partial<Table>);
  }

  /**
   * Získá všechny stoly projektu
   */
  async getByProjectId(
    projectId: string
  ): Promise<Result<readonly Table[], RepositoryError>> {
    try {
      const tables = await this.table
        .where('projectId')
        .equals(projectId)
        .toArray();

      return success(tables);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá stůl na konkrétní pozici
   */
  async getByPosition(
    projectId: string,
    position: TablePosition
  ): Promise<Result<Table | null, RepositoryError>> {
    try {
      const table = await this.table
        .where('projectId')
        .equals(projectId)
        .filter(
          (t) =>
            t.position.row === position.row &&
            t.position.column === position.column
        )
        .first();

      return success(table ?? null);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá stoly s vypočtenými hodnotami
   */
  async getTablesWithCalculations(
    projectId: string
  ): Promise<Result<readonly TableWithCalculations[], RepositoryError>> {
    const tablesResult = await this.getByProjectId(projectId);

    if (!tablesResult.success) {
      return tablesResult;
    }

    const enriched = tablesResult.data.map(enrichTableWithCalculations);
    return success(enriched);
  }

  /**
   * Získá stoly s work state (pro FieldMap)
   */
  async getTablesWithWorkState(
    projectId: string
  ): Promise<Result<readonly TableWithWorkState[], RepositoryError>> {
    try {
      const db = getDatabase();

      // Získáme stoly
      const tables = await db.solarTables
        .where('projectId')
        .equals(projectId)
        .toArray();

      // Získáme work states
      const tableIds = tables.map((t) => t.id);
      const workStates = await db.tableWorkStates
        .where('tableId')
        .anyOf(tableIds)
        .toArray();

      // Vytvoříme mapu work states
      const workStateMap = new Map<string, TableWorkState>();
      for (const ws of workStates) {
        workStateMap.set(ws.tableId, ws);
      }

      // Spojíme data
      const result: TableWithWorkState[] = tables.map((table) => {
        const withCalc = enrichTableWithCalculations(table);
        const workState = workStateMap.get(table.id);
        return enrichTableWithWorkState(withCalc, workState);
      });

      return success(result);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá konkrétní stoly podle ID s work state
   */
  async getTablesByIdsWithWorkState(
    ids: readonly string[]
  ): Promise<Result<readonly TableWithWorkState[], RepositoryError>> {
    try {
      const db = getDatabase();

      const tables = await db.solarTables
        .where('id')
        .anyOf([...ids])
        .toArray();

      const workStates = await db.tableWorkStates
        .where('tableId')
        .anyOf([...ids])
        .toArray();

      const workStateMap = new Map<string, TableWorkState>();
      for (const ws of workStates) {
        workStateMap.set(ws.tableId, ws);
      }

      const result: TableWithWorkState[] = tables.map((table) => {
        const withCalc = enrichTableWithCalculations(table);
        const workState = workStateMap.get(table.id);
        return enrichTableWithWorkState(withCalc, workState);
      });

      return success(result);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Smaže všechny stoly projektu
   */
  async deleteByProjectId(
    projectId: string
  ): Promise<Result<void, RepositoryError>> {
    try {
      const db = getDatabase();

      await db.transaction('rw', [db.solarTables, db.tableWorkStates], async () => {
        const tables = await db.solarTables
          .where('projectId')
          .equals(projectId)
          .toArray();

        const tableIds = tables.map((t) => t.id);

        await db.tableWorkStates.bulkDelete(tableIds);
        await db.solarTables.where('projectId').equals(projectId).delete();
      });

      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Počet stolů v projektu
   */
  async countByProjectId(projectId: string): Promise<number> {
    return this.table.where('projectId').equals(projectId).count();
  }
}

/**
 * Singleton instance
 */
let instance: TableRepositoryImpl | null = null;

/**
 * Získá instanci Table repository
 */
export function getTableRepository(): TableRepositoryImpl {
  if (!instance) {
    instance = new TableRepositoryImpl();
  }
  return instance;
}

/**
 * Export typu
 */
export type TableRepository = TableRepositoryImpl;
