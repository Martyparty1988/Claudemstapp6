/**
 * FieldMap - SelectionBar Component
 * 
 * Spodní lišta zobrazující aktuální výběr stolů.
 * Zobrazí se pouze když je něco vybráno.
 * 
 * PRAVIDLA:
 * - Žádná business logika
 * - Pouze zobrazení + eventy
 */

import React, { useEffect } from 'react';
import { Button, hapticFeedback } from '../../../shared';
import type { FieldMapSelectionVM } from '../../../application';

/**
 * Props
 */
export interface SelectionBarProps {
  /** Selection state */
  selection: FieldMapSelectionVM;
  /** Callback pro potvrzení */
  onConfirm: () => void;
  /** Callback pro zrušení výběru */
  onClear: () => void;
  /** Je potvrzení disabled */
  confirmDisabled?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Pomocná funkce pro české skloňování "stůl"
 */
function getTableWord(count: number): string {
  if (count === 1) return 'stůl';
  if (count >= 2 && count <= 4) return 'stoly';
  return 'stolů';
}

/**
 * SelectionBar Component
 */
export function SelectionBar({
  selection,
  onConfirm,
  onClear,
  confirmDisabled = false,
  className = '',
}: SelectionBarProps) {
  // Haptic feedback při změně výběru
  useEffect(() => {
    if (selection.selectedCount > 0) {
      hapticFeedback('light');
    }
  }, [selection.selectedCount]);

  // Nezobrazovat pokud nic není vybráno
  if (selection.selectedCount === 0) {
    return null;
  }

  const handleConfirm = () => {
    hapticFeedback('medium');
    onConfirm();
  };

  const handleClear = () => {
    hapticFeedback('light');
    onClear();
  };

  return (
    <div
      className={`
        fixed-bottom-safe
        bg-white/95 backdrop-blur-ios
        border-t border-ios-gray-4
        shadow-ios-sheet
        animate-fade-in
        ${className}
      `}
    >
      <div className="px-4 py-3">
        {/* Summary row */}
        <div className="flex items-center justify-between mb-3">
          {/* Left - info */}
          <div>
            <p className="text-ios-headline text-gray-900">
              {selection.selectedCount} {getTableWord(selection.selectedCount)}
            </p>
            <p className="text-ios-caption1 text-ios-gray">
              {selection.summary.totalStrings} stringů · {selection.summary.totalKwp} kWp
            </p>
          </div>

          {/* Right - clear button */}
          <button
            onClick={handleClear}
            className="text-ios-blue text-ios-subhead touch-target touch-feedback"
          >
            Zrušit
          </button>
        </div>

        {/* Confirm button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleConfirm}
          disabled={confirmDisabled}
        >
          Potvrdit práci
        </Button>
      </div>
    </div>
  );
}

/**
 * SelectionBarCompact - kompaktní verze pro inline zobrazení
 */
export function SelectionBarCompact({
  selection,
  onConfirm,
  onClear,
}: Omit<SelectionBarProps, 'className' | 'confirmDisabled'>) {
  if (selection.selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-ios-blue text-white rounded-ios-lg">
      <div className="flex items-center gap-2">
        <span className="font-semibold">{selection.selectedCount}</span>
        <span className="text-white/80">vybráno</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          className="px-3 py-1 text-sm text-white/80 touch-feedback"
        >
          Zrušit
        </button>
        <button
          onClick={onConfirm}
          className="px-3 py-1 text-sm font-semibold bg-white text-ios-blue rounded-full touch-feedback"
        >
          Potvrdit
        </button>
      </div>
    </div>
  );
}
