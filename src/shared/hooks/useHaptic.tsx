/**
 * MST Haptic Feedback
 * 
 * Hook pro haptickou odezvu na mobilních zařízeních.
 */

import { useCallback } from 'react';

/**
 * Haptic feedback typy
 */
export type HapticType = 
  | 'light'      // Jemný tap
  | 'medium'     // Střední feedback
  | 'heavy'      // Silný feedback
  | 'success'    // Úspěšná akce
  | 'warning'    // Varování
  | 'error'      // Chyba
  | 'selection'; // Změna výběru

/**
 * Vibration patterns (ms)
 */
const VIBRATION_PATTERNS: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 20],
  warning: [20, 100, 20],
  error: [30, 100, 30, 100, 30],
  selection: 5,
};

/**
 * Kontrola podpory Vibration API
 */
function isVibrationSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Kontrola podpory iOS Haptic Feedback (experimentální)
 */
function isIOSHapticSupported(): boolean {
  // @ts-ignore - experimentální API
  return typeof window !== 'undefined' && 'HapticFeedback' in window;
}

/**
 * useHaptic hook
 */
export function useHaptic() {
  /**
   * Trigger haptic feedback
   */
  const trigger = useCallback((type: HapticType = 'light') => {
    // Zkusit iOS Haptic Feedback (pokud je dostupný)
    if (isIOSHapticSupported()) {
      try {
        // @ts-ignore
        window.HapticFeedback?.trigger(type);
        return;
      } catch {
        // Fallback na Vibration API
      }
    }

    // Fallback na Vibration API
    if (isVibrationSupported()) {
      try {
        const pattern = VIBRATION_PATTERNS[type];
        navigator.vibrate(pattern);
      } catch {
        // Vibrace není dostupná
      }
    }
  }, []);

  /**
   * Convenience metody
   */
  const light = useCallback(() => trigger('light'), [trigger]);
  const medium = useCallback(() => trigger('medium'), [trigger]);
  const heavy = useCallback(() => trigger('heavy'), [trigger]);
  const success = useCallback(() => trigger('success'), [trigger]);
  const warning = useCallback(() => trigger('warning'), [trigger]);
  const error = useCallback(() => trigger('error'), [trigger]);
  const selection = useCallback(() => trigger('selection'), [trigger]);

  /**
   * Impact feedback (iOS style)
   */
  const impact = useCallback((style: 'light' | 'medium' | 'heavy' = 'medium') => {
    trigger(style);
  }, [trigger]);

  /**
   * Notification feedback (iOS style)
   */
  const notification = useCallback((type: 'success' | 'warning' | 'error' = 'success') => {
    trigger(type);
  }, [trigger]);

  return {
    trigger,
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    impact,
    notification,
    isSupported: isVibrationSupported() || isIOSHapticSupported(),
  };
}

/**
 * Utility funkce pro jednorázové volání bez hooku
 */
export function triggerHaptic(type: HapticType = 'light'): void {
  if (isVibrationSupported()) {
    try {
      const pattern = VIBRATION_PATTERNS[type];
      navigator.vibrate(pattern);
    } catch {
      // Ignorovat chyby
    }
  }
}

/**
 * HOC pro přidání haptic feedback k onClick handleru
 */
export function withHapticFeedback<T extends { onClick?: (e: React.MouseEvent) => void }>(
  Component: React.ComponentType<T>,
  hapticType: HapticType = 'light'
): React.ComponentType<T> {
  return function WithHaptic(props: T) {
    const haptic = useHaptic();
    
    const handleClick = (e: React.MouseEvent) => {
      haptic.trigger(hapticType);
      props.onClick?.(e);
    };

    return <Component {...props} onClick={handleClick} />;
  };
}

/**
 * Hook pro button s haptic feedback
 */
export function useHapticButton(
  onClick?: () => void,
  hapticType: HapticType = 'light'
) {
  const haptic = useHaptic();

  const handleClick = useCallback(() => {
    haptic.trigger(hapticType);
    onClick?.();
  }, [haptic, hapticType, onClick]);

  return handleClick;
}

/**
 * Hook pro selection s haptic feedback
 */
export function useHapticSelection<T>(
  onSelect?: (value: T) => void
) {
  const haptic = useHaptic();

  const handleSelect = useCallback((value: T) => {
    haptic.selection();
    onSelect?.(value);
  }, [haptic, onSelect]);

  return handleSelect;
}

export default useHaptic;
