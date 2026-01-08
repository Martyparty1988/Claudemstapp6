/**
 * MST usePWA Hook
 * 
 * React hook pro PWA funkcionalitu.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  registerServiceWorker,
  setupPWAListeners,
  getPWAState,
  isStandalone,
  canInstall,
  promptInstall,
  applyUpdate,
  requestSync,
  checkForUpdates,
  type PWAState,
} from './registration';

/**
 * Extended PWA state for hook
 */
export interface UsePWAState extends PWAState {
  isStandalone: boolean;
  canInstall: boolean;
}

/**
 * usePWA return type
 */
export interface UsePWAReturn {
  state: UsePWAState;
  install: () => Promise<boolean>;
  update: () => void;
  checkUpdates: () => Promise<void>;
  requestSync: (tag: string) => Promise<boolean>;
}

/**
 * usePWA Hook
 */
export function usePWA(): UsePWAReturn {
  const [state, setState] = useState<UsePWAState>(() => ({
    ...getPWAState(),
    isStandalone: isStandalone(),
    canInstall: canInstall(),
  }));

  // Initialize PWA
  useEffect(() => {
    // Register Service Worker
    registerServiceWorker('/sw.js', {
      onUpdateAvailable: () => {
        setState((prev) => ({ ...prev, isUpdateAvailable: true }));
      },
      onOnline: () => {
        setState((prev) => ({ ...prev, isOnline: true }));
      },
      onOffline: () => {
        setState((prev) => ({ ...prev, isOnline: false }));
      },
      onSyncMessage: (data) => {
        console.log('[usePWA] Sync message:', data);
      },
    });

    // Setup listeners
    setupPWAListeners({
      onInstallPrompt: () => {
        setState((prev) => ({ ...prev, canInstall: true }));
      },
    });

    // Update state
    setState((prev) => ({
      ...prev,
      ...getPWAState(),
      isStandalone: isStandalone(),
      canInstall: canInstall(),
    }));
  }, []);

  // Install handler
  const install = useCallback(async () => {
    const result = await promptInstall();
    setState((prev) => ({
      ...prev,
      isInstalled: result,
      canInstall: !result && canInstall(),
    }));
    return result;
  }, []);

  // Update handler
  const update = useCallback(() => {
    applyUpdate();
  }, []);

  // Check for updates
  const checkUpdates = useCallback(async () => {
    await checkForUpdates();
    setState((prev) => ({
      ...prev,
      ...getPWAState(),
    }));
  }, []);

  // Request sync
  const doRequestSync = useCallback(async (tag: string) => {
    return requestSync(tag);
  }, []);

  return {
    state,
    install,
    update,
    checkUpdates,
    requestSync: doRequestSync,
  };
}

/**
 * useOnlineStatus hook - jednodušší hook jen pro online stav
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
