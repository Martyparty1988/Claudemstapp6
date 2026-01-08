/**
 * FieldMap - FilterBar Component
 * 
 * Filtrování stolů podle statusu.
 * 
 * PRAVIDLA:
 * - Žádná business logika
 * - Pouze UI + eventy
 */

import React from 'react';
import { ChipGroup, type ChipOption } from '../../../shared';

/**
 * Filter options
 */
export type TableFilter = 'all' | 'pending' | 'completed' | 'in_progress';

const FILTER_OPTIONS: readonly ChipOption[] = [
  { value: 'all', label: 'Vše' },
  { value: 'pending', label: 'Čeká' },
  { value: 'in_progress', label: 'Probíhá' },
  { value: 'completed', label: 'Hotovo' },
];

/**
 * Props
 */
export interface FilterBarProps {
  /** Aktuální filtr */
  filter: TableFilter;
  /** Callback při změně filtru */
  onFilterChange: (filter: TableFilter) => void;
  /** Počty pro jednotlivé filtry */
  counts?: {
    all: number;
    pending: number;
    completed: number;
    in_progress: number;
  };
  /** Custom className */
  className?: string;
}

/**
 * FilterBar Component
 */
export function FilterBar({
  filter,
  onFilterChange,
  counts,
  className = '',
}: FilterBarProps) {
  // Přidáme počty do labelů pokud jsou dostupné
  const optionsWithCounts: readonly ChipOption[] = counts
    ? FILTER_OPTIONS.map((opt) => ({
        ...opt,
        label: `${opt.label} (${counts[opt.value as TableFilter]})`,
      }))
    : FILTER_OPTIONS;

  return (
    <div className={`overflow-x-auto scrollbar-hide -mx-4 px-4 ${className}`}>
      <ChipGroup
        options={optionsWithCounts}
        value={filter}
        onChange={(value) => onFilterChange(value as TableFilter)}
      />
    </div>
  );
}

/**
 * FilterBarSimple - jednodušší verze bez počtů
 */
export function FilterBarSimple({
  filter,
  onFilterChange,
  className = '',
}: Omit<FilterBarProps, 'counts'>) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onFilterChange(opt.value as TableFilter)}
          className={`
            px-3 py-1.5 rounded-full text-ios-footnote font-medium
            transition-colors duration-100
            ${filter === opt.value
              ? 'bg-ios-blue text-white'
              : 'bg-ios-gray-5 text-gray-700 active:bg-ios-gray-4'}
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
