/**
 * MST PWA Registration
 * 
 * Registrace Service Worker a PWA utilities.
 */

/**
 * PWA State
 */
export interface PWAState {
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

/**
 * PWA Event callbacks
 */
export interface PWACallbacks {
  onInstallPrompt?: (event: BeforeInstallPromptEvent) => void;
  onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
  onSyncMessage?: (data: any) => void;
}

/**
 * BeforeInstallPromptEvent type
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Globální state
 */
let pwaState: PWAState = {
  isInstalled: false,
  isOnline: navigator.onLine,
  isUpdateAvailable: false,
  registration: null,
};

let installPromptEvent: BeforeInstallPromptEvent | null = null;
let callbacks: PWACallbacks = {};

/**
 * Register Service Worker
 */
export async function registerServiceWorker(
  swUrl: string = '/sw.js',
  cb?: PWACallbacks
): Promise<ServiceWorkerRegistration | null> {
  if (cb) {
    callbacks = cb;
  }

  // Kontrola podpory
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Worker not supported');
    return null;
  }

  try {
    console.log('[PWA] Registering Service Worker...');
    
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: '/',
    });

    pwaState.registration = registration;

    // Kontrola aktualizací
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] Update available');
            pwaState.isUpdateAvailable = true;
            callbacks.onUpdateAvailable?.(registration);
          }
        });
      }
    });

    // Message handler
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[PWA] Message from SW:', event.data);
      callbacks.onSyncMessage?.(event.data);
    });

    console.log('[PWA] Service Worker registered:', registration.scope);
    return registration;
    
  } catch (error) {
    console.error('[PWA] Registration failed:', error);
    return null;
  }
}

/**
 * Setup PWA event listeners
 */
export function setupPWAListeners(cb?: PWACallbacks): void {
  if (cb) {
    callbacks = { ...callbacks, ...cb };
  }

  // Online/Offline events
  window.addEventListener('online', () => {
    console.log('[PWA] Online');
    pwaState.isOnline = true;
    callbacks.onOnline?.();
  });

  window.addEventListener('offline', () => {
    console.log('[PWA] Offline');
    pwaState.isOnline = false;
    callbacks.onOffline?.();
  });

  // Install prompt
  window.addEventListener('beforeinstallprompt', (event) => {
    console.log('[PWA] Install prompt available');
    event.preventDefault();
    installPromptEvent = event as BeforeInstallPromptEvent;
    callbacks.onInstallPrompt?.(installPromptEvent);
  });

  // App installed
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed');
    pwaState.isInstalled = true;
    installPromptEvent = null;
  });
}

/**
 * Get current PWA state
 */
export function getPWAState(): PWAState {
  return { ...pwaState };
}

/**
 * Check if app is installed (standalone)
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Check if install is available
 */
export function canInstall(): boolean {
  return installPromptEvent !== null;
}

/**
 * Prompt user to install
 */
export async function promptInstall(): Promise<boolean> {
  if (!installPromptEvent) {
    console.warn('[PWA] Install prompt not available');
    return false;
  }

  try {
    await installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    
    console.log('[PWA] Install outcome:', outcome);
    
    if (outcome === 'accepted') {
      pwaState.isInstalled = true;
      installPromptEvent = null;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[PWA] Install failed:', error);
    return false;
  }
}

/**
 * Apply pending update
 */
export function applyUpdate(): void {
  if (!pwaState.registration?.waiting) {
    console.warn('[PWA] No update waiting');
    return;
  }

  pwaState.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  window.location.reload();
}

/**
 * Request background sync
 */
export async function requestSync(tag: string): Promise<boolean> {
  if (!pwaState.registration) {
    console.warn('[PWA] No registration');
    return false;
  }

  if (!('sync' in pwaState.registration)) {
    console.warn('[PWA] Background Sync not supported');
    return false;
  }

  try {
    await (pwaState.registration as any).sync.register(tag);
    console.log('[PWA] Sync registered:', tag);
    return true;
  } catch (error) {
    console.error('[PWA] Sync registration failed:', error);
    return false;
  }
}

/**
 * Send message to Service Worker
 */
export function sendMessageToSW(message: any): void {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

/**
 * Cache specific URLs
 */
export function cacheUrls(urls: string[]): void {
  sendMessageToSW({ type: 'CACHE_URLS', payload: { urls } });
}

/**
 * Clear cache
 */
export function clearCache(cacheName?: string): void {
  sendMessageToSW({ type: 'CLEAR_CACHE', payload: { cacheName } });
}

/**
 * Check for updates
 */
export async function checkForUpdates(): Promise<void> {
  if (pwaState.registration) {
    await pwaState.registration.update();
  }
}
