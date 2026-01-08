/**
 * MST Settings Repository
 * 
 * Data access layer pro aplikační nastavení.
 * Key-value storage pro offline konfiguraci.
 */

import { getDatabase, type SettingsRecord } from '../database';
import { type RepositoryError, databaseError } from './base.repository';
import type { Result } from '../../domain';
import { success, failure } from '../../domain';

/**
 * Známé klíče nastavení
 */
export const SETTINGS_KEYS = {
  LAST_ACTIVE_PROJECT: 'lastActiveProject',
  WORKER_NAME: 'workerName',
  DEFAULT_WORK_TYPE: 'defaultWorkType',
  THEME: 'theme',
  SYNC_ENABLED: 'syncEnabled',
  LAST_SYNC_AT: 'lastSyncAt',
} as const;

export type SettingsKey = (typeof SETTINGS_KEYS)[keyof typeof SETTINGS_KEYS];

/**
 * Settings Repository
 */
class SettingsRepositoryImpl {
  private get table() {
    return getDatabase().settings;
  }

  /**
   * Získá hodnotu nastavení
   */
  async get<T>(key: string): Promise<Result<T | null, RepositoryError>> {
    try {
      const record = await this.table.get(key);
      return success(record ? (record.value as T) : null);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Nastaví hodnotu
   */
  async set<T>(key: string, value: T): Promise<Result<void, RepositoryError>> {
    try {
      const record: SettingsRecord = {
        key,
        value,
        updatedAt: Date.now(),
      };

      await this.table.put(record);
      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Odstraní nastavení
   */
  async remove(key: string): Promise<Result<void, RepositoryError>> {
    try {
      await this.table.delete(key);
      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá více hodnot najednou
   */
  async getMany<T extends Record<string, unknown>>(
    keys: readonly string[]
  ): Promise<Result<Partial<T>, RepositoryError>> {
    try {
      const records = await this.table
        .where('key')
        .anyOf([...keys])
        .toArray();

      const result: Record<string, unknown> = {};
      for (const record of records) {
        result[record.key] = record.value;
      }

      return success(result as Partial<T>);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Nastaví více hodnot najednou
   */
  async setMany(
    values: Record<string, unknown>
  ): Promise<Result<void, RepositoryError>> {
    try {
      const now = Date.now();
      const records: SettingsRecord[] = Object.entries(values).map(
        ([key, value]) => ({
          key,
          value,
          updatedAt: now,
        })
      );

      await this.table.bulkPut(records);
      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Vymaže všechna nastavení
   */
  async clear(): Promise<Result<void, RepositoryError>> {
    try {
      await this.table.clear();
      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  // === Typed helpers pro běžná nastavení ===

  /**
   * Získá ID posledního aktivního projektu
   */
  async getLastActiveProjectId(): Promise<string | null> {
    const result = await this.get<string>(SETTINGS_KEYS.LAST_ACTIVE_PROJECT);
    return result.success ? result.data : null;
  }

  /**
   * Nastaví ID posledního aktivního projektu
   */
  async setLastActiveProjectId(projectId: string): Promise<void> {
    await this.set(SETTINGS_KEYS.LAST_ACTIVE_PROJECT, projectId);
  }

  /**
   * Získá jméno pracovníka
   */
  async getWorkerName(): Promise<string | null> {
    const result = await this.get<string>(SETTINGS_KEYS.WORKER_NAME);
    return result.success ? result.data : null;
  }

  /**
   * Nastaví jméno pracovníka
   */
  async setWorkerName(name: string): Promise<void> {
    await this.set(SETTINGS_KEYS.WORKER_NAME, name);
  }

  /**
   * Kontrola, zda je sync povolený
   */
  async isSyncEnabled(): Promise<boolean> {
    const result = await this.get<boolean>(SETTINGS_KEYS.SYNC_ENABLED);
    return result.success ? result.data ?? false : false;
  }

  /**
   * Nastaví sync enabled
   */
  async setSyncEnabled(enabled: boolean): Promise<void> {
    await this.set(SETTINGS_KEYS.SYNC_ENABLED, enabled);
  }
}

/**
 * Singleton instance
 */
let instance: SettingsRepositoryImpl | null = null;

/**
 * Získá instanci repository
 */
export function getSettingsRepository(): SettingsRepositoryImpl {
  if (!instance) {
    instance = new SettingsRepositoryImpl();
  }
  return instance;
}

/**
 * Export typu
 */
export type SettingsRepository = SettingsRepositoryImpl;
