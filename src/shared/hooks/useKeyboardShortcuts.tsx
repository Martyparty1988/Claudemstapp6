/**
 * MST Keyboard Shortcuts
 * 
 * Hook pro globální klávesové zkratky.
 */

import { useEffect, useCallback, useRef } from 'react';

/**
 * Shortcut definition
 */
export interface KeyboardShortcut {
  /** Klávesa (např. 'k', 'Escape', 'Enter') */
  key: string;
  /** Ctrl/Cmd modifikátor */
  ctrl?: boolean;
  /** Shift modifikátor */
  shift?: boolean;
  /** Alt/Option modifikátor */
  alt?: boolean;
  /** Meta (Cmd na Mac, Win na Windows) */
  meta?: boolean;
  /** Callback */
  handler: (event: KeyboardEvent) => void;
  /** Popis pro UI */
  description?: string;
  /** Povolit i v input polích */
  allowInInput?: boolean;
}

/**
 * useKeyboardShortcuts hook
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorovat opakované eventy (držení klávesy)
      if (event.repeat) return;

      const target = event.target as HTMLElement;
      const isInInput = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      for (const shortcut of shortcutsRef.current) {
        // Kontrola input polí
        if (isInInput && !shortcut.allowInInput) continue;

        // Kontrola modifikátorů
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const metaMatch = shortcut.meta ? event.metaKey : true; // Meta je volitelná

        // Kontrola klávesy
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          event.preventDefault();
          shortcut.handler(event);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

/**
 * useGlobalShortcuts - běžné globální zkratky pro aplikaci
 */
export function useGlobalShortcuts({
  onSearch,
  onNewItem,
  onBack,
  onSave,
  onRefresh,
  onToggleTheme,
}: {
  onSearch?: () => void;
  onNewItem?: () => void;
  onBack?: () => void;
  onSave?: () => void;
  onRefresh?: () => void;
  onToggleTheme?: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [];

  if (onSearch) {
    shortcuts.push({
      key: 'k',
      ctrl: true,
      handler: onSearch,
      description: 'Vyhledávání',
    });
    shortcuts.push({
      key: '/',
      handler: onSearch,
      description: 'Vyhledávání',
    });
  }

  if (onNewItem) {
    shortcuts.push({
      key: 'n',
      ctrl: true,
      handler: onNewItem,
      description: 'Nová položka',
    });
  }

  if (onBack) {
    shortcuts.push({
      key: 'Escape',
      handler: onBack,
      description: 'Zpět',
      allowInInput: true,
    });
  }

  if (onSave) {
    shortcuts.push({
      key: 's',
      ctrl: true,
      handler: onSave,
      description: 'Uložit',
      allowInInput: true,
    });
  }

  if (onRefresh) {
    shortcuts.push({
      key: 'r',
      ctrl: true,
      handler: onRefresh,
      description: 'Obnovit',
    });
  }

  if (onToggleTheme) {
    shortcuts.push({
      key: 'd',
      ctrl: true,
      shift: true,
      handler: onToggleTheme,
      description: 'Přepnout téma',
    });
  }

  useKeyboardShortcuts(shortcuts);
}

/**
 * useNavigationShortcuts - zkratky pro navigaci
 */
export function useNavigationShortcuts({
  onTab1,
  onTab2,
  onTab3,
  onTab4,
  onTab5,
}: {
  onTab1?: () => void;
  onTab2?: () => void;
  onTab3?: () => void;
  onTab4?: () => void;
  onTab5?: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [];

  if (onTab1) shortcuts.push({ key: '1', ctrl: true, handler: onTab1, description: 'Tab 1' });
  if (onTab2) shortcuts.push({ key: '2', ctrl: true, handler: onTab2, description: 'Tab 2' });
  if (onTab3) shortcuts.push({ key: '3', ctrl: true, handler: onTab3, description: 'Tab 3' });
  if (onTab4) shortcuts.push({ key: '4', ctrl: true, handler: onTab4, description: 'Tab 4' });
  if (onTab5) shortcuts.push({ key: '5', ctrl: true, handler: onTab5, description: 'Tab 5' });

  useKeyboardShortcuts(shortcuts);
}

/**
 * Keyboard Shortcuts Help Component
 */
export function KeyboardShortcutsHelp({
  shortcuts,
  className = '',
}: {
  shortcuts: { key: string; description: string; modifiers?: string[] }[];
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {shortcuts.map((shortcut, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {shortcut.description}
          </span>
          <div className="flex items-center gap-1">
            {shortcut.modifiers?.map((mod, i) => (
              <kbd
                key={i}
                className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
              >
                {mod}
              </kbd>
            ))}
            <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              {shortcut.key}
            </kbd>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Default shortcuts info pro zobrazení v help
 */
export const DEFAULT_SHORTCUTS_INFO = [
  { key: 'K', description: 'Vyhledávání', modifiers: ['⌘'] },
  { key: 'N', description: 'Nová položka', modifiers: ['⌘'] },
  { key: 'S', description: 'Uložit', modifiers: ['⌘'] },
  { key: 'R', description: 'Obnovit', modifiers: ['⌘'] },
  { key: 'D', description: 'Přepnout téma', modifiers: ['⌘', '⇧'] },
  { key: 'Esc', description: 'Zpět / Zavřít' },
  { key: '1-5', description: 'Přepnout tab', modifiers: ['⌘'] },
];

export default useKeyboardShortcuts;
