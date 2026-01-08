/**
 * FieldMap - QuickActions Component
 * 
 * Rychlé akce pro výběr stolů.
 */

import React from 'react';
import { Chip } from '../../../shared';

/**
 * Props
 */
export interface QuickActionsProps {
  /** Je něco vybráno */
  hasSelection: boolean;
  /** Počet pending stolů */
  pendingCount: number;
  /** Vybrat všechny pending */
  onSelectAllPending: () => void;
  /** Zrušit výběr */
  onClearSelection: () => void;
  /** Refresh */
  onRefresh: () => void;
  /** Custom className */
  className?: string;
}

/**
 * QuickActions Component
 */
export function QuickActions({
  hasSelection,
  pendingCount,
  onSelectAllPending,
  onClearSelection,
  onRefresh,
  className = '',
}: QuickActionsProps) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto scrollbar-hide ${className}`}>
      {/* Select all pending */}
      {pendingCount > 0 && !hasSelection && (
        <Chip
          onPress={onSelectAllPending}
          leftIcon={<SelectAllIcon />}
        >
          Vybrat vše ({pendingCount})
        </Chip>
      )}

      {/* Clear selection */}
      {hasSelection && (
        <Chip
          onPress={onClearSelection}
          leftIcon={<ClearIcon />}
        >
          Zrušit výběr
        </Chip>
      )}

      {/* Refresh */}
      <Chip
        onPress={onRefresh}
        leftIcon={<RefreshIcon />}
      >
        Obnovit
      </Chip>
    </div>
  );
}

/**
 * Icons
 */
function SelectAllIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
