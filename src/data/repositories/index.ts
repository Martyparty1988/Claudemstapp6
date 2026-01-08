/**
 * Repositories - Public API
 */

// Base
export {
  BaseRepository,
  type RepositoryError,
  type ListOptions,
  DEFAULT_LIST_OPTIONS,
  notFoundError,
  databaseError,
} from './base.repository';

// Project
export {
  getProjectRepository,
  type ProjectRepository,
  type ProjectListOptions,
} from './project.repository';

// Table
export {
  getTableRepository,
  type TableRepository,
} from './table.repository';

// Table Work State
export {
  getTableWorkStateRepository,
  type TableWorkStateRepository,
} from './table-work-state.repository';

// Work Record
export {
  getWorkRecordRepository,
  type WorkRecordRepository,
  type WorkRecordListOptions,
} from './work-record.repository';

// Settings
export {
  getSettingsRepository,
  type SettingsRepository,
  SETTINGS_KEYS,
  type SettingsKey,
} from './settings.repository';

// Sync Queue
export {
  getSyncQueueRepository,
  type SyncQueueRepository,
} from './sync-queue.repository';

// Chat
export {
  chatRepository,
  type ChatRepository,
} from './chat-repository';
