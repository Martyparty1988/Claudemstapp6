/**
 * MST Work Record Repository
 * 
 * Data access layer pro pracovní záznamy.
 * Work Record je vytvořen po potvrzení v bottom-sheetu.
 */

import { getDatabase } from '../database';
import {
  BaseRepository,
  type RepositoryError,
  type ListOptions,
  databaseError,
} from './base.repository';
import { getTableWorkStateRepository } from './table-work-state.repository';
import type {
  WorkRecord,
  WorkType,
  WorkStatus,
  CreateWorkRecordDto,
  UpdateWorkRecordDto,
  TimeRange,
  Result,
  PaginatedResult,
} from '../../domain';
import {
  createWorkRecord,
  updateWorkRecord as domainUpdateWorkRecord,
  validateCreateWorkRecordDto,
  validateUpdateWorkRecordDto,
  WORK_STATUS,
  success,
  failure,
} from '../../domain';

/**
 * Options pro filtrování work records
 */
export interface WorkRecordListOptions extends ListOptions {
  readonly projectId?: string;
  readonly workType?: WorkType;
  readonly status?: WorkStatus;
  readonly timeRange?: TimeRange;
}

/**
 * Work Record Repository
 */
class WorkRecordRepositoryImpl extends BaseRepository<WorkRecord> {
  constructor() {
    super(getDatabase().workRecords, 'WorkRecord');
  }

  /**
   * Vytvoří nový work record s validací
   * Také aktualizuje work states stolů
   */
  async createWorkRecord(
    dto: CreateWorkRecordDto
  ): Promise<Result<WorkRecord, RepositoryError>> {
    const validationResult = validateCreateWorkRecordDto(dto);
    if (!validationResult.success) {
      return failure({
        code: 'VALIDATION_ERROR',
        message: validationResult.error.message,
      });
    }

    const record = createWorkRecord(validationResult.data);

    try {
      const db = getDatabase();

      await db.transaction(
        'rw',
        [db.workRecords, db.tableWorkStates],
        async () => {
          // Uložíme work record
          await db.workRecords.add(record);

          // Aktualizujeme work states stolů
          const workStateRepo = getTableWorkStateRepository();

          if (record.status === WORK_STATUS.completed) {
            await workStateRepo.markAsCompleted(record.tableIds, record.id);
          } else {
            // Pro jiné statusy aktualizujeme jednotlivě
            for (const tableId of record.tableIds) {
              await workStateRepo.updateStatus(
                tableId,
                record.status,
                record.id
              );
            }
          }
        }
      );

      return success(record);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Aktualizuje work record
   */
  async updateWorkRecord(
    id: string,
    dto: UpdateWorkRecordDto
  ): Promise<Result<WorkRecord, RepositoryError>> {
    const validationResult = validateUpdateWorkRecordDto(dto);
    if (!validationResult.success) {
      return failure({
        code: 'VALIDATION_ERROR',
        message: validationResult.error.message,
      });
    }

    const existingResult = await this.getById(id);
    if (!existingResult.success) {
      return existingResult;
    }

    const updated = domainUpdateWorkRecord(
      existingResult.data,
      validationResult.data
    );

    try {
      const db = getDatabase();

      await db.transaction(
        'rw',
        [db.workRecords, db.tableWorkStates],
        async () => {
          await db.workRecords.put(updated);

          // Pokud se změnil status, aktualizujeme work states
          if (dto.status && dto.status !== existingResult.data.status) {
            const workStateRepo = getTableWorkStateRepository();

            if (dto.status === WORK_STATUS.completed) {
              await workStateRepo.markAsCompleted(updated.tableIds, updated.id);
            } else {
              for (const tableId of updated.tableIds) {
                await workStateRepo.updateStatus(tableId, dto.status, updated.id);
              }
            }
          }
        }
      );

      return success(updated);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá work records projektu
   */
  async getByProjectId(
    projectId: string
  ): Promise<Result<readonly WorkRecord[], RepositoryError>> {
    try {
      const records = await this.table
        .where('projectId')
        .equals(projectId)
        .toArray();

      return success(records);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá work records s filtrováním
   */
  async listWorkRecords(
    options: WorkRecordListOptions = {}
  ): Promise<Result<PaginatedResult<WorkRecord>, RepositoryError>> {
    try {
      const { projectId, workType, status, timeRange, ...listOptions } = options;

      let collection = this.table.toCollection();

      // Filtrujeme
      if (projectId) {
        collection = this.table.where('projectId').equals(projectId);
      }

      let records = await collection.toArray();

      // Další filtry
      if (workType) {
        records = records.filter((r) => r.workType === workType);
      }

      if (status) {
        records = records.filter((r) => r.status === status);
      }

      if (timeRange) {
        records = records.filter(
          (r) =>
            r.startedAt >= timeRange.from && r.startedAt <= timeRange.to
        );
      }

      // Řazení
      const orderDirection = listOptions.orderDirection ?? 'desc';
      records.sort((a, b) => {
        const diff = b.createdAt - a.createdAt;
        return orderDirection === 'desc' ? diff : -diff;
      });

      // Paginace
      const offset = listOptions.offset ?? 0;
      const limit = listOptions.limit ?? 50;
      const items = records.slice(offset, offset + limit);

      return success({
        items,
        total: records.length,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        hasMore: offset + items.length < records.length,
      });
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá work records v časovém rozmezí
   */
  async getByTimeRange(
    projectId: string,
    timeRange: TimeRange
  ): Promise<Result<readonly WorkRecord[], RepositoryError>> {
    try {
      const records = await this.table
        .where('projectId')
        .equals(projectId)
        .filter(
          (r) =>
            r.startedAt >= timeRange.from && r.startedAt <= timeRange.to
        )
        .toArray();

      return success(records);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá dnešní work records
   */
  async getTodayRecords(
    projectId: string
  ): Promise<Result<readonly WorkRecord[], RepositoryError>> {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    return this.getByTimeRange(projectId, {
      from: startOfDay,
      to: endOfDay,
    });
  }

  /**
   * Získá poslední work record projektu
   */
  async getLastRecord(
    projectId: string
  ): Promise<Result<WorkRecord | null, RepositoryError>> {
    try {
      const record = await this.table
        .where('projectId')
        .equals(projectId)
        .reverse()
        .first();

      return success(record ?? null);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Smaže work records projektu
   */
  async deleteByProjectId(
    projectId: string
  ): Promise<Result<void, RepositoryError>> {
    try {
      await this.table.where('projectId').equals(projectId).delete();
      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Počet work records v projektu
   */
  async countByProjectId(projectId: string): Promise<number> {
    return this.table.where('projectId').equals(projectId).count();
  }
}

/**
 * Singleton instance
 */
let instance: WorkRecordRepositoryImpl | null = null;

/**
 * Získá instanci repository
 */
export function getWorkRecordRepository(): WorkRecordRepositoryImpl {
  if (!instance) {
    instance = new WorkRecordRepositoryImpl();
  }
  return instance;
}

/**
 * Export typu
 */
export type WorkRecordRepository = WorkRecordRepositoryImpl;
