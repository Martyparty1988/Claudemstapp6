/**
 * MST Shared Layer - Public API
 * 
 * Sdílené komponenty, hooks a utility.
 * BEZ business logiky, BEZ přístupu k datům.
 * 
 * PRAVIDLA:
 * - Komponenty jsou hloupé (neznají stav aplikace)
 * - Hooks jsou utility (ne business logika)
 * - Utils jsou čisté funkce
 */

// UI Components
export * from './ui';

// Hooks
export {
  useDisclosure,
  useDebounce,
  usePrevious,
  useLocalStorage,
  useMediaQuery,
  useIsMobile,
  useIsStandalone,
  useLongPress,
  useOnClickOutside,
  useKeyPress,
  useScrollLock,
  // Keyboard shortcuts
  useKeyboardShortcuts,
  useGlobalShortcuts,
  useNavigationShortcuts,
  KeyboardShortcutsHelp,
  DEFAULT_SHORTCUTS_INFO,
  // Haptic feedback
  useHaptic,
  useHapticButton,
  useHapticSelection,
  triggerHaptic,
} from './hooks';

// Utils
export {
  cn,
  formatNumber,
  formatPercent,
  truncate,
  generateId,
  delay,
  clamp,
  isIOS,
  isSafari,
  isStandalonePWA,
  hapticFeedback,
  copyToClipboard,
  debounce,
  throttle,
  groupBy,
  scrollToTop,
} from './utils';
