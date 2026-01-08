/**
 * MST Data Layer - Public API
 * 
 * Tento modul exportuje veškerý přístup k datům.
 * 
 * PRAVIDLA:
 * - UI NIKDY nepřistupuje přímo k databázi
 * - Veškerý přístup k datům je přes repositories
 * - Dexie (IndexedDB) je JEDINÝ zdroj pravdy
 * - Firebase sync je VOLITELNÝ a ODDĚLENÝ
 * 
 * STRUKTURA:
 * - database: Dexie instance a schema
 * - repositories: Data access layer
 * - seed: Demo data pro development
 * - migrations: (připraveno pro budoucí migrace)
 */

// Database
export {
  // Instance
  getDatabase,
  resetDatabase,
  closeDatabase,
  isDatabaseReady,
  MSTDatabase,
  // Schema
  DATABASE_NAME,
  DATABASE_VERSION,
  TABLE_SCHEMAS,
  type SyncEntityType,
  type SyncOperation,
  type SyncQueueItem,
  type SettingsRecord,
} from './database';

// Repositories
export {
  // Base
  BaseRepository,
  type RepositoryError,
  type ListOptions,
  DEFAULT_LIST_OPTIONS,
  notFoundError,
  databaseError,
  // Project
  getProjectRepository,
  type ProjectRepository,
  type ProjectListOptions,
  // Table
  getTableRepository,
  type TableRepository,
  // Table Work State
  getTableWorkStateRepository,
  type TableWorkStateRepository,
  // Work Record
  getWorkRecordRepository,
  type WorkRecordRepository,
  type WorkRecordListOptions,
  // Settings
  getSettingsRepository,
  type SettingsRepository,
  SETTINGS_KEYS,
  type SettingsKey,
  // Sync Queue
  getSyncQueueRepository,
  type SyncQueueRepository,
  // Chat
  chatRepository,
  type ChatRepository,
} from './repositories';

// Seed Data (development only)
export {
  SEED_PROJECTS,
  getSeedProjectById,
  getActiveSeedProjects,
  SEED_TABLES,
  getSeedTablesForProject,
  SEED_WORK_STATES,
  SEED_WORK_RECORDS,
  getSeedWorkRecordsForProject,
  getRecentSeedWorkRecords,
  CURRENT_USER,
  SEED_USERS,
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  getSeedUserById,
  getSeedMessagesForConversation,
  getSeedConversationWithDetails,
  seedService,
  useSeedData,
} from './seed';
