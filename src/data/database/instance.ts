/**
 * MST Database Instance
 * 
 * Singleton instance Dexie databáze.
 * NIKDY nepřistupovat k databázi přímo z UI - pouze přes repositories.
 */

import Dexie, { type Table } from 'dexie';
import {
  DATABASE_NAME,
  DATABASE_VERSION,
  TABLE_SCHEMAS,
  type SyncQueueItem,
  type SettingsRecord,
} from './schema';
import type {
  Project,
  Table as TableEntity,
  TableWorkState,
  WorkRecord,
} from '../../domain';
import type {
  ConversationRecord,
  MessageRecord,
  ChatUserRecord,
  DraftRecord,
} from './chat-schema';

/**
 * Typovaná Dexie databáze
 */
export class MSTDatabase extends Dexie {
  // Tabulky s typy - Core
  projects!: Table<Project, string>;
  solarTables!: Table<TableEntity, string>;
  tableWorkStates!: Table<TableWorkState, string>;
  workRecords!: Table<WorkRecord, string>;
  syncQueue!: Table<SyncQueueItem, number>;
  settings!: Table<SettingsRecord, string>;

  // Tabulky s typy - Chat
  conversations!: Table<ConversationRecord, string>;
  messages!: Table<MessageRecord, string>;
  chatUsers!: Table<ChatUserRecord, string>;
  messageDrafts!: Table<DraftRecord, string>;

  constructor() {
    super(DATABASE_NAME);

    // Definice schématu
    this.version(DATABASE_VERSION).stores(TABLE_SCHEMAS);
  }
}

/**
 * Singleton instance databáze
 */
let dbInstance: MSTDatabase | null = null;

/**
 * Získá instanci databáze (lazy initialization)
 */
export function getDatabase(): MSTDatabase {
  if (!dbInstance) {
    dbInstance = new MSTDatabase();
  }
  return dbInstance;
}

/**
 * Resetuje databázi (pro testy a debug)
 */
export async function resetDatabase(): Promise<void> {
  const db = getDatabase();
  await db.delete();
  dbInstance = null;
}

/**
 * Zavře databázi
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Kontrola, zda je databáze připravena
 */
export async function isDatabaseReady(): Promise<boolean> {
  try {
    const db = getDatabase();
    await db.open();
    return db.isOpen();
  } catch {
    return false;
  }
}
