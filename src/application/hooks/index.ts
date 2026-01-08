/**
 * Application Hooks - Public API
 */

export { useProjects, type UseProjectsReturn } from './useProjects';
export { useFieldMap, type UseFieldMapReturn } from './useFieldMap';
export { useWorkRecords, type UseWorkRecordsReturn, type WorkRecordFilterOptions } from './useWorkRecords';
export { useSettings, type UseSettingsReturn, type AppSettingsVM } from './useSettings';
export { useAsync, useAsyncEffect, useDebouncedAsync, type UseAsyncReturn, type UseAsyncOptions } from './useAsync';

// Auth & Sync
export { AuthProvider, useAuth, useRequireAuth } from './useAuth';
export { useSync, useSyncStatus, type UseSyncReturn } from './useSync';

// Chat
export {
  useConversations,
  useConversation,
  useChatUsers,
  useCreateConversation,
  useNewConversation,
  CURRENT_USER,
} from './useChat';

// Chat Realtime (Firebase)
export {
  useRealtimeConversations,
  useRealtimeMessages,
} from './useRealtimeChat';
