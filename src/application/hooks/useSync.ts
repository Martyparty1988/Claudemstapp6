/**
 * MST useSync Hook
 * 
 * React hook pro synchronizaci s Firebase.
 */

import { useState, useEffect, useCallback } from 'react';
import { syncService, type SyncStatus, type SyncResult, isFirebaseConfigured } from '../../firebase';

/**
 * useSync return type
 */
export interface UseSyncReturn {
  status: SyncStatus;
  sync: () => Promise<SyncResult>;
  forceSync: () => Promise<SyncResult>;
  isConfigured: boolean;
}

/**
 * useSync Hook
 */
export function useSync(): UseSyncReturn {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    lastSyncAt: null,
    error: null,
  });

  const isConfigured = isFirebaseConfigured();

  // Subscribe to sync status changes
  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    // Get initial status
    syncService.getStatus().then(setStatus);

    // Subscribe to changes
    const unsubscribe = syncService.subscribe(setStatus);

    // Initialize sync service
    syncService.initialize();

    return () => {
      unsubscribe();
    };
  }, [isConfigured]);

  // Sync
  const sync = useCallback(async (): Promise<SyncResult> => {
    if (!isConfigured) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: ['Firebase není nakonfigurován'],
      };
    }

    return syncService.sync();
  }, [isConfigured]);

  // Force sync
  const forceSync = useCallback(async (): Promise<SyncResult> => {
    if (!isConfigured) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: ['Firebase není nakonfigurován'],
      };
    }

    return syncService.forceSync();
  }, [isConfigured]);

  return {
    status,
    sync,
    forceSync,
    isConfigured,
  };
}

/**
 * useSyncStatus - jednodušší hook jen pro status
 */
export function useSyncStatus() {
  const { status, isConfigured } = useSync();
  
  return {
    isOnline: status.isOnline,
    isSyncing: status.isSyncing,
    pendingCount: status.pendingCount,
    lastSyncAt: status.lastSyncAt,
    isConfigured,
  };
}
