/**
 * MST Sync Service
 * 
 * Synchronizace mezi lokální Dexie DB a Firebase Firestore.
 * Offline-first architektura - Dexie je vždy zdroj pravdy.
 */

import { firestoreService, COLLECTIONS } from './firestore.service';
import { getSyncQueueRepository } from '../data';
import type { SyncQueueItem, SyncEntityType, SyncOperation } from '../data';

/**
 * Sync status
 */
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: Date | null;
  error: string | null;
}

/**
 * Sync result
 */
export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

/**
 * Entity mapper - mapování mezi Dexie a Firestore formáty
 */
type EntityMapper<TLocal, TRemote> = {
  toRemote: (local: TLocal) => TRemote;
  toLocal: (remote: TRemote) => TLocal;
};

/**
 * Sync Service
 */
class SyncService {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private lastSyncAt: Date | null = null;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  constructor() {
    // Sledovat online/offline stav
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  /**
   * Inicializovat sync service
   */
  async initialize(): Promise<void> {
    console.log('[Sync] Initializing...');

    // Spustit pravidelnou synchronizaci
    this.startAutoSync();

    // Pokud jsme online, synchronizovat hned
    if (this.isOnline) {
      await this.sync();
    }
  }

  /**
   * Zastavit sync service
   */
  destroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.stopAutoSync();
  }

  /**
   * Hlavní sync metoda
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[Sync] Already syncing, skipping...');
      return { success: true, syncedCount: 0, failedCount: 0, errors: [] };
    }

    if (!this.isOnline) {
      console.log('[Sync] Offline, skipping...');
      return { success: false, syncedCount: 0, failedCount: 0, errors: ['Offline'] };
    }

    this.isSyncing = true;
    this.notifyListeners();

    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      console.log('[Sync] Starting sync...');

      // 1. Zpracovat pending operace z queue
      const pendingResult = await this.processPendingOperations();
      result.syncedCount += pendingResult.syncedCount;
      result.failedCount += pendingResult.failedCount;
      result.errors.push(...pendingResult.errors);

      // 2. Pull změny ze serveru
      // Poznámka: Pro plnou implementaci je potřeba:
      // - Ukládat lastSyncTimestamp per entity type
      // - Query Firestore pro změny od posledního sync
      // - Mergovat změny do lokální DB
      // Pro MVP offline-first je toto volitelné

      this.lastSyncAt = new Date();
      console.log('[Sync] Sync completed:', result);

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      console.error('[Sync] Sync failed:', error);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }

    return result;
  }

  /**
   * Zpracovat pending operace ze sync queue
   */
  private async processPendingOperations(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    };

    const syncQueueRepo = getSyncQueueRepository();
    const pendingResult = await syncQueueRepo.getPending();

    if (!pendingResult.success || pendingResult.data.length === 0) {
      return result;
    }

    console.log(`[Sync] Processing ${pendingResult.data.length} pending operations...`);

    for (const item of pendingResult.data) {
      try {
        await this.processQueueItem(item);
        await syncQueueRepo.markCompleted(item.id!);
        result.syncedCount++;
      } catch (error) {
        console.error(`[Sync] Failed to process item ${item.id}:`, error);
        
        // Inkrementovat retry count
        if ((item.attempts || 0) < 3) {
          await syncQueueRepo.update(item.id!, {
            attempts: (item.attempts || 0) + 1,
            lastAttemptAt: Date.now(),
          });
        } else {
          await syncQueueRepo.update(item.id!, {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
        
        result.failedCount++;
        result.errors.push(`${item.entityType}/${item.entityId}: ${error}`);
      }
    }

    return result;
  }

  /**
   * Zpracovat jednu položku z queue
   */
  private async processQueueItem(item: SyncQueueItem): Promise<void> {
    const collectionName = this.getCollectionName(item.entityType);
    
    switch (item.operation) {
      case 'create':
      case 'update':
        await firestoreService.setDocument(
          collectionName,
          item.entityId,
          item.payload ?? {},
          'system'
        );
        break;

      case 'delete':
        await firestoreService.softDeleteDocument(
          collectionName,
          item.entityId,
          'system'
        );
        break;

      default:
        throw new Error(`Unknown operation: ${item.operation}`);
    }
  }

  /**
   * Mapování entity type na Firestore kolekci
   */
  private getCollectionName(entityType: SyncEntityType): string {
    const mapping: Record<SyncEntityType, string> = {
      project: COLLECTIONS.PROJECTS,
      table: COLLECTIONS.TABLES,
      workRecord: COLLECTIONS.WORK_RECORDS,
      tableWorkState: COLLECTIONS.WORK_STATES,
    };

    return mapping[entityType] || entityType;
  }

  /**
   * Přidat operaci do sync queue
   */
  async queueOperation(
    entityType: SyncEntityType,
    entityId: string,
    operation: SyncOperation,
    data: unknown,
    _userId?: string
  ): Promise<void> {
    const syncQueueRepo = getSyncQueueRepository();
    
    await syncQueueRepo.create({
      entityType,
      entityId,
      operation,
      payload: data,
      createdAt: Date.now(),
      attempts: 0,
    });

    // Pokud jsme online, zkusit okamžitě synchronizovat
    if (this.isOnline && !this.isSyncing) {
      // Debounce - počkat 1s před sync
      setTimeout(() => this.sync(), 1000);
    }
  }

  /**
   * Automatická synchronizace
   */
  private startAutoSync(): void {
    // Sync každých 30 sekund
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.sync();
      }
    }, 30000);
  }

  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Event handlers
   */
  private handleOnline = (): void => {
    console.log('[Sync] Online');
    this.isOnline = true;
    this.notifyListeners();
    
    // Synchronizovat po připojení
    this.sync();
  };

  private handleOffline = (): void => {
    console.log('[Sync] Offline');
    this.isOnline = false;
    this.notifyListeners();
  };

  /**
   * Získat aktuální status
   */
  async getStatus(): Promise<SyncStatus> {
    const syncQueueRepo = getSyncQueueRepository();
    const pendingResult = await syncQueueRepo.getPending();

    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: pendingResult.success ? pendingResult.data.length : 0,
      lastSyncAt: this.lastSyncAt,
      error: null,
    };
  }

  /**
   * Listeners pro status změny
   */
  subscribe(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private async notifyListeners(): Promise<void> {
    const status = await this.getStatus();
    this.listeners.forEach((callback) => callback(status));
  }

  /**
   * Force sync
   */
  async forceSync(): Promise<SyncResult> {
    this.isSyncing = false; // Reset
    return this.sync();
  }
}

// Singleton instance
export const syncService = new SyncService();

export type { SyncService };
