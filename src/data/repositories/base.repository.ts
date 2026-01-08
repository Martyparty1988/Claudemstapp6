/**
 * MST Base Repository
 * 
 * Abstraktní základ pro všechny repositories.
 * Poskytuje common CRUD operace.
 */

import type { Table } from 'dexie';
import type { Result, PaginatedResult } from '../../domain';
import { success, failure } from '../../domain';

/**
 * Chyby repository operací
 */
export type RepositoryError =
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'ALREADY_EXISTS'; message: string }
  | { code: 'VALIDATION_ERROR'; message: string }
  | { code: 'DATABASE_ERROR'; message: string };

/**
 * Vytvoří NOT_FOUND chybu
 */
export function notFoundError(entity: string, id: string): RepositoryError {
  return {
    code: 'NOT_FOUND',
    message: `${entity} with id '${id}' not found`,
  };
}

/**
 * Vytvoří DATABASE_ERROR
 */
export function databaseError(message: string): RepositoryError {
  return {
    code: 'DATABASE_ERROR',
    message,
  };
}

/**
 * Options pro list operace
 */
export interface ListOptions {
  readonly offset?: number;
  readonly limit?: number;
  readonly orderBy?: string;
  readonly orderDirection?: 'asc' | 'desc';
}

/**
 * Default list options
 */
export const DEFAULT_LIST_OPTIONS: Required<ListOptions> = {
  offset: 0,
  limit: 50,
  orderBy: 'createdAt',
  orderDirection: 'desc',
};

/**
 * Base repository třída
 */
export abstract class BaseRepository<T extends { id: string }> {
  constructor(
    protected readonly table: Table<T, string>,
    protected readonly entityName: string
  ) {}

  /**
   * Získá entitu podle ID
   */
  async getById(id: string): Promise<Result<T, RepositoryError>> {
    try {
      const entity = await this.table.get(id);

      if (!entity) {
        return failure(notFoundError(this.entityName, id));
      }

      return success(entity);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá všechny entity
   */
  async getAll(): Promise<Result<readonly T[], RepositoryError>> {
    try {
      const entities = await this.table.toArray();
      return success(entities);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá entity s paginací
   */
  async list(
    options: ListOptions = {}
  ): Promise<Result<PaginatedResult<T>, RepositoryError>> {
    try {
      const opts = { ...DEFAULT_LIST_OPTIONS, ...options };

      // Získáme celkový počet
      const total = await this.table.count();

      // Získáme data s paginací
      let collection = this.table.orderBy(opts.orderBy);

      if (opts.orderDirection === 'desc') {
        collection = collection.reverse();
      }

      const items = await collection
        .offset(opts.offset)
        .limit(opts.limit)
        .toArray();

      return success({
        items,
        total,
        page: Math.floor(opts.offset / opts.limit) + 1,
        pageSize: opts.limit,
        hasMore: opts.offset + items.length < total,
      });
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Vytvoří novou entitu
   */
  async create(entity: T): Promise<Result<T, RepositoryError>> {
    try {
      await this.table.add(entity);
      return success(entity);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Vytvoří více entit najednou
   */
  async createMany(entities: readonly T[]): Promise<Result<readonly T[], RepositoryError>> {
    try {
      await this.table.bulkAdd([...entities]);
      return success(entities);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Aktualizuje entitu
   */
  async update(id: string, updates: Partial<T>): Promise<Result<T, RepositoryError>> {
    try {
      const existing = await this.table.get(id);

      if (!existing) {
        return failure(notFoundError(this.entityName, id));
      }

      const updated = { ...existing, ...updates, updatedAt: Date.now() } as T;
      await this.table.put(updated);

      return success(updated);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Smaže entitu
   */
  async delete(id: string): Promise<Result<void, RepositoryError>> {
    try {
      const existing = await this.table.get(id);

      if (!existing) {
        return failure(notFoundError(this.entityName, id));
      }

      await this.table.delete(id);
      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Smaže více entit
   */
  async deleteMany(ids: readonly string[]): Promise<Result<void, RepositoryError>> {
    try {
      await this.table.bulkDelete([...ids]);
      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Kontrola existence
   */
  async exists(id: string): Promise<boolean> {
    const entity = await this.table.get(id);
    return entity !== undefined;
  }

  /**
   * Počet entit
   */
  async count(): Promise<number> {
    return this.table.count();
  }
}
