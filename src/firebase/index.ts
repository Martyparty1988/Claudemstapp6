/**
 * MST Firebase - Public API
 * 
 * Centrální export pro všechny Firebase služby.
 * 
 * ARCHITEKTURA:
 * - Firebase je VOLITELNÝ sync layer
 * - Dexie (IndexedDB) je vždy zdroj pravdy
 * - Všechny operace jdou nejdřív do Dexie, pak se synchronizují
 */

// Config
export {
  initializeFirebase,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseFirestore,
  getFirebaseStorage,
  isFirebaseConfigured,
  getFirebaseStatus,
  type FirebaseStatus,
} from './config';

// Auth
export {
  authService,
  type AuthService,
  type MSTUser,
  type AuthState,
} from './auth.service';

// Firestore
export {
  firestoreService,
  COLLECTIONS,
  type FirestoreService,
  type SyncMetadata,
  type FirestoreDocument,
} from './firestore.service';

// Storage
export {
  storageService,
  STORAGE_PATHS,
  type StorageService,
  type UploadResult,
  type UploadProgressCallback,
} from './storage.service';

// Sync
export {
  syncService,
  type SyncService,
  type SyncStatus,
  type SyncResult,
} from './sync.service';

// Real-time Chat
export {
  realtimeChatService,
  type RealtimeChatService,
} from './realtime-chat.service';

// Chat Realtime
export {
  chatRealtimeService,
  CHAT_COLLECTIONS,
  type FirestoreConversation,
  type FirestoreMessage,
  type FirestoreTyping,
} from './chat-realtime.service';
