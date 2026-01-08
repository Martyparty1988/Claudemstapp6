/**
 * MST Database Schema
 * 
 * Definice IndexedDB schématu pro Dexie.
 * Toto je JEDINÝ zdroj pravdy pro strukturu databáze.
 */

/**
 * Aktuální verze databáze
 * Inkrementovat při každé změně schématu
 */
export const DATABASE_VERSION = 2;

/**
 * Název databáze
 */
export const DATABASE_NAME = 'mst-database';

/**
 * Definice indexů pro jednotlivé tabulky
 * 
 * Syntaxe:
 * - '++id' = auto-increment primary key
 * - 'id' = primary key
 * - '&field' = unique index
 * - 'field' = regular index
 * - '[field1+field2]' = compound index
 * - '*field' = multi-entry index (pro array)
 */
export const TABLE_SCHEMAS = {
  /**
   * Projekty (solární elektrárny)
   */
  projects: 'id, name, status, createdAt, updatedAt',

  /**
   * Stoly (solární trackery)
   * Compound index pro rychlé vyhledávání v rámci projektu
   */
  solarTables: 'id, projectId, [projectId+position.row], [projectId+position.column], size, createdAt',

  /**
   * Stavy práce na stolech
   * Odděleno od tables pro lepší performance při častých updatech
   */
  tableWorkStates: 'tableId, status, completedAt',

  /**
   * Pracovní záznamy
   */
  workRecords: 'id, projectId, workType, status, startedAt, completedAt, createdAt',

  /**
   * Sync metadata (pro budoucí Firebase sync)
   * Sleduje, které záznamy potřebují synchronizaci
   */
  syncQueue: '++id, entityType, entityId, operation, createdAt',

  /**
   * App settings (offline konfigurace)
   */
  settings: 'key',

  // ============ CHAT TABULKY ============

  /**
   * Chat konverzace
   */
  conversations: 'id, type, projectId, updatedAt, isPinned',

  /**
   * Chat zprávy
   */
  messages: 'id, conversationId, senderId, sentAt, [conversationId+sentAt]',

  /**
   * Chat uživatelé
   */
  chatUsers: 'id, name, isOnline',

  /**
   * Drafty zpráv
   */
  messageDrafts: 'conversationId',
} as const;

/**
 * Typy entit pro sync queue
 */
export type SyncEntityType = 'project' | 'table' | 'tableWorkState' | 'workRecord';

/**
 * Operace pro sync queue
 */
export type SyncOperation = 'create' | 'update' | 'delete';

/**
 * Záznam v sync queue
 */
export interface SyncQueueItem {
  id?: number;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  payload?: unknown;
  createdAt: number;
  attempts: number;
  lastAttemptAt?: number;
  error?: string;
}

/**
 * App settings záznam
 */
export interface SettingsRecord {
  key: string;
  value: unknown;
  updatedAt: number;
}
