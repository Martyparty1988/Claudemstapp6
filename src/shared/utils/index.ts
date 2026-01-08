/**
 * MST Shared Utils
 * 
 * Utility funkce pro UI.
 * BEZ business logiky.
 */

/**
 * Spojí CSS třídy, filtruje falsy hodnoty
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formátuje číslo s oddělovačem tisíců
 */
export function formatNumber(value: number, locale = 'cs-CZ'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Formátuje procenta
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Zkrátí text na max délku
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Generuje unikátní ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Delay helper
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamp hodnotu do rozsahu
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Kontrola, zda je iOS
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Kontrola, zda je Safari
 */
export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;

  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

/**
 * Kontrola, zda je standalone PWA
 */
export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

/**
 * Haptic feedback (pokud dostupný)
 */
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  if (typeof navigator === 'undefined') return;

  if ('vibrate' in navigator) {
    const durations = {
      light: 10,
      medium: 20,
      heavy: 30,
    };
    navigator.vibrate(durations[type]);
  }
}

/**
 * Kopíruje text do schránky
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback pro starší prohlížeče
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Vytvoří debounced funkci
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Vytvoří throttled funkci
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Group array by key
 */
export function groupBy<T>(array: readonly T[], key: keyof T): Map<T[keyof T], T[]> {
  return array.reduce((map, item) => {
    const groupKey = item[key];
    const existing = map.get(groupKey) || [];
    map.set(groupKey, [...existing, item]);
    return map;
  }, new Map<T[keyof T], T[]>());
}

/**
 * Scroll to top
 */
export function scrollToTop(smooth = true): void {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto',
  });
}
