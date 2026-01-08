/**
 * MST PWA - Public API
 */

// Registration & utilities
export {
  registerServiceWorker,
  setupPWAListeners,
  getPWAState,
  isStandalone,
  canInstall,
  promptInstall,
  applyUpdate,
  requestSync,
  sendMessageToSW,
  cacheUrls,
  clearCache,
  checkForUpdates,
  type PWAState,
  type PWACallbacks,
} from './registration';

// Hooks
export {
  usePWA,
  useOnlineStatus,
  type UsePWAState,
  type UsePWAReturn,
} from './usePWA';

// Components
export {
  OfflineBanner,
  OfflineBannerCompact,
  UpdatePrompt,
  UpdatePromptMinimal,
  InstallPrompt,
  InstallBanner,
} from './components';
