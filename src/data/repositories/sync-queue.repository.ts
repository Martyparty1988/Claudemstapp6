/**
 * MST Sync Queue Repository
 * 
 * Data access layer pro sync queue.
 * Připraveno pro budoucí Firebase synchronizaci.
 * 
 * ZATÍM NEAKTIVNÍ - pouze infrastruktura.
 */

import { getDatabase, type SyncQueueItem, type SyncEntityType, type SyncOperation } from '../database';
import { type RepositoryError, databaseError } from './base.repository';
import type { Result } from '../../domain';
import { success, failure } from '../../domain';

/**
 * Max počet pokusů o sync
 */
const MAX_SYNC_ATTEMPTS = 5;

/**
 * Sync Queue Repository
 */
class SyncQueueRepositoryImpl {
  private get table() {
    return getDatabase().syncQueue;
  }

  /**
   * Přidá položku do sync queue
   */
  async enqueue(
    entityType: SyncEntityType,
    entityId: string,
    operation: SyncOperation,
    payload?: unknown
  ): Promise<Result<SyncQueueItem, RepositoryError>> {
    try {
      const item: Omit<SyncQueueItem, 'id'> = {
        entityType,
        entityId,
        operation,
        payload,
        createdAt: Date.now(),
        attempts: 0,
      };

      const id = await this.table.add(item as SyncQueueItem);

      return success({ ...item, id } as SyncQueueItem);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá položky čekající na sync
   */
  async getPending(
    limit: number = 50
  ): Promise<Result<readonly SyncQueueItem[], RepositoryError>> {
    try {
      const items = await this.table
        .filter((item) => item.attempts < MAX_SYNC_ATTEMPTS)
        .limit(limit)
        .toArray();

      return success(items);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Označí položku jako úspěšně synchronizovanou (smaže ji)
   */
  async markCompleted(id: number): Promise<Result<void, RepositoryError>> {
    try {
      await this.table.delete(id);
      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Označí položku jako neúspěšnou (inkrementuje attempts)
   */
  async markFailed(
    id: number,
    error: string
  ): Promise<Result<void, RepositoryError>> {
    try {
      const item = await this.table.get(id);

      if (!item) {
        return success(undefined);
      }

      await this.table.update(id, {
        attempts: item.attempts + 1,
        lastAttemptAt: Date.now(),
        error,
      });

      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá počet čekajících položek
   */
  async getPendingCount(): Promise<number> {
    return this.table.filter((item) => item.attempts < MAX_SYNC_ATTEMPTS).count();
  }

  /**
   * Získá položky s chybou (vyčerpané pokusy)
   */
  async getFailed(): Promise<Result<readonly SyncQueueItem[], RepositoryError>> {
    try {
      const items = await this.table
        .filter((item) => item.attempts >= MAX_SYNC_ATTEMPTS)
        .toArray();

      return success(items);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Vymaže všechny položky
   */
  async clear(): Promise<Result<void, RepositoryError>> {
    try {
      await this.table.clear();
      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Resetuje pokusy pro všechny položky
   */
  async resetAllAttempts(): Promise<Result<void, RepositoryError>> {
    try {
      await this.table.toCollection().modify({ attempts: 0, error: undefined });
      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Smaže položky pro konkrétní entitu
   */
  async removeByEntity(
    entityType: SyncEntityType,
    entityId: string
  ): Promise<Result<void, RepositoryError>> {
    try {
      await this.table
        .filter(
          (item) =>
            item.entityType === entityType && item.entityId === entityId
        )
        .delete();

      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Vytvoří novou položku v queue (alias pro enqueue)
   */
  async create(item: Omit<SyncQueueItem, 'id'>): Promise<number> {
    return this.table.add(item as SyncQueueItem);
  }

  /**
   * Aktualizuje položku
   */
  async update(id: number, updates: Partial<SyncQueueItem>): Promise<void> {
    await this.table.update(id, updates);
  }
}

/**
 * Singleton instance
 */
let instance: SyncQueueRepositoryImpl | null = null;

/**
 * Získá instanci repository
 */
export function getSyncQueueRepository(): SyncQueueRepositoryImpl {
  if (!instance) {
    instance = new SyncQueueRepositoryImpl();
  }
  return instance;
}

/**
 * Export typu
 */
export type SyncQueueRepository = SyncQueueRepositoryImpl;
