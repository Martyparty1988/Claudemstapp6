/**
 * FieldMap - RowSelector Component
 * 
 * Komponenta pro rychlý výběr celých řádků stolů.
 * 
 * PRAVIDLA:
 * - Žádná business logika
 * - Pouze UI + eventy
 */

import React from 'react';
import { Chip } from '../../../shared';

/**
 * Props
 */
export interface RowSelectorProps {
  /** Počet řádků */
  rowCount: number;
  /** Aktuálně vybrané řádky */
  selectedRows: readonly number[];
  /** Callback při výběru řádku */
  onRowSelect: (rowIndex: number) => void;
  /** Callback pro výběr všech */
  onSelectAll: () => void;
  /** Callback pro zrušení */
  onClearAll: () => void;
  /** Custom className */
  className?: string;
}

/**
 * RowSelector Component
 */
export function RowSelector({
  rowCount,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onClearAll,
  className = '',
}: RowSelectorProps) {
  const allSelected = selectedRows.length === rowCount;
  const someSelected = selectedRows.length > 0;

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-ios-footnote text-ios-gray">Vybrat řádek</p>
        
        {someSelected ? (
          <button
            onClick={onClearAll}
            className="text-ios-footnote text-ios-blue touch-feedback"
          >
            Zrušit vše
          </button>
        ) : (
          <button
            onClick={onSelectAll}
            className="text-ios-footnote text-ios-blue touch-feedback"
          >
            Vybrat vše
          </button>
        )}
      </div>

      {/* Row chips */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: rowCount }, (_, i) => {
          const isSelected = selectedRows.includes(i);
          
          return (
            <Chip
              key={i}
              selected={isSelected}
              onPress={() => onRowSelect(i)}
            >
              Řádek {i + 1}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}

/**
 * RowSelectorCompact - inline verze
 */
export function RowSelectorCompact({
  rowCount,
  selectedRows,
  onRowSelect,
  className = '',
}: Omit<RowSelectorProps, 'onSelectAll' | 'onClearAll'>) {
  return (
    <div className={`flex gap-1 overflow-x-auto scrollbar-hide ${className}`}>
      {Array.from({ length: rowCount }, (_, i) => {
        const isSelected = selectedRows.includes(i);
        
        return (
          <button
            key={i}
            onClick={() => onRowSelect(i)}
            className={`
              px-2 py-1 rounded-full text-ios-caption1 font-medium
              transition-colors duration-100
              ${isSelected 
                ? 'bg-ios-blue text-white' 
                : 'bg-ios-gray-5 text-gray-700'}
            `}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
