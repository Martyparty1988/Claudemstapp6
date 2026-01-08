/**
 * MST Application Layer - Public API
 * 
 * Tento modul je MOST mezi data a UI vrstvou.
 * 
 * PRAVIDLA:
 * - UI importuje POUZE z tohoto modulu (+ domain typy)
 * - UI NIKDY neimportuje přímo z data vrstvy
 * - Hooks vrací AsyncState<T> (loading / error / data)
 * - View-modely jsou JEDINÉ typy co UI renderuje
 * 
 * STRUKTURA:
 * - types: AsyncState, MutationState
 * - view-models: Typy pro UI (ProjectListItemVM, TableCellVM, ...)
 * - mappers: Transformace domain → view-model
 * - hooks: React hooks pro UI
 */

// Types
export {
  type AsyncStatus,
  type AsyncState,
  type MutationState,
  type MutationCallbacks,
  idleState,
  loadingState,
  successState,
  errorState,
  defaultMutationState,
  isIdle,
  isLoading,
  isSuccess,
  isError,
  hasData,
} from './types';

// View Models - Project
export {
  type ProjectListItemVM,
  type ProjectDetailVM,
  type ProjectStatisticsVM,
  type CreateProjectFormVM,
  DEFAULT_CREATE_PROJECT_FORM,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from './view-models';

// View Models - FieldMap
export {
  type TableCellVM,
  type FieldMapVM,
  type FieldMapStatisticsVM,
  type FieldMapSelectionVM,
  type SelectionSummaryVM,
  type WorkConfirmationSheetVM,
  DEFAULT_WORK_CONFIRMATION,
  WORK_STATUS_COLORS,
  WORK_STATUS_LABELS,
  TABLE_SIZE_LABELS,
  WORK_TYPE_LABELS,
  EMPTY_SELECTION,
} from './view-models';

// View Models - Work Record
export {
  type WorkRecordListItemVM,
  type WorkRecordDetailVM,
  type DailyWorkSummaryVM,
  type GroupedWorkRecordsVM,
  type WorkStatisticsVM,
  WORK_RECORD_STATUS_COLORS,
} from './view-models';

// Hooks
export {
  useProjects,
  type UseProjectsReturn,
  useFieldMap,
  type UseFieldMapReturn,
  useWorkRecords,
  type UseWorkRecordsReturn,
  type WorkRecordFilterOptions,
  useSettings,
  type UseSettingsReturn,
  type AppSettingsVM,
  useAsync,
  useAsyncEffect,
  useDebouncedAsync,
  type UseAsyncReturn,
  type UseAsyncOptions,
} from './hooks';

// Mappers (pro případné custom použití)
export {
  mapProjectToListItem,
  mapProjectToDetail,
  mapProjectStatistics,
  mapToFieldMapVM,
  mapToSelectionVM,
  mapTableToCell,
  mapWorkRecordToListItem,
  mapToGroupedWorkRecords,
  calculateWorkStatistics,
} from './mappers';

// Chat View Models
export {
  type ConversationListItemVM,
  type ConversationDetailVM,
  type MessageVM,
  type MessageSenderVM,
  type MessageReplyVM,
  type ChatUserVM,
  type ChatInputVM,
  type TypingIndicatorVM,
} from './view-models/chat-vm';

// Chat Hooks
export {
  useConversations,
  useConversation,
  useChatUsers,
  useCreateConversation,
  CURRENT_USER,
} from './hooks/useChat';
