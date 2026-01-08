/**
 * FieldMap - TableGrid Component
 * 
 * Mřížka stolů pro FieldMap.
 * Kompozice shared/ui Grid + application view-models.
 * 
 * PRAVIDLA:
 * - Žádná business logika
 * - Pouze zobrazení + eventy
 * - Žádné výpočty
 */

import React, { useCallback, useRef } from 'react';
import { 
  Grid, 
  GridCell, 
  GridLegend, 
  GridOverlay,
  DEFAULT_GRID_LEGEND, 
  Spinner,
  type CellStatus 
} from '../../../shared';
import type { TableCellVM } from '../../../application';

/**
 * Props
 */
export interface TableGridProps {
  /** Stoly k zobrazení */
  tables: readonly TableCellVM[];
  /** Počet sloupců */
  columns: number;
  /** Callback při kliknutí na stůl */
  onTablePress: (tableId: string) => void;
  /** Callback při long press */
  onTableLongPress?: (tableId: string) => void;
  /** Zobrazit legendu */
  showLegend?: boolean;
  /** Je načítání */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Mapování work status na cell status
 */
function mapWorkStatusToCellStatus(status: string): CellStatus {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'in_progress':
      return 'in-progress';
    case 'skipped':
      return 'skipped';
    default:
      return 'pending';
  }
}

/**
 * TableGrid Component
 */
export function TableGrid({
  tables,
  columns,
  onTablePress,
  onTableLongPress,
  showLegend = true,
  isLoading = false,
  className = '',
}: TableGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Render jednotlivé buňky
   */
  const renderCell = useCallback(
    (table: TableCellVM) => (
      <GridCell
        key={table.id}
        id={table.id}
        label={table.label}
        status={mapWorkStatusToCellStatus(table.status)}
        isSelected={table.isSelected}
        onPress={onTablePress}
        onLongPress={onTableLongPress}
        size="md"
      />
    ),
    [onTablePress, onTableLongPress]
  );

  return (
    <div className={`relative ${className}`}>
      {/* Legend */}
      {showLegend && (
        <div className="mb-3 px-1">
          <GridLegend items={DEFAULT_GRID_LEGEND} />
        </div>
      )}

      {/* Grid container with iOS-style scroll */}
      <div 
        ref={containerRef}
        className="overflow-auto scrollbar-hide -mx-4 px-4 pb-4"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Grid
          items={tables}
          columns={columns}
          renderCell={renderCell}
          gap="sm"
        />
      </div>

      {/* Loading overlay */}
      <GridOverlay visible={isLoading}>
        <Spinner size="lg" />
      </GridOverlay>
    </div>
  );
}

/**
 * TableGridMini - miniatura pro preview
 */
export interface TableGridMiniProps {
  tables: readonly TableCellVM[];
  columns: number;
  className?: string;
}

export function TableGridMini({
  tables,
  columns,
  className = '',
}: TableGridMiniProps) {
  const renderCell = useCallback(
    (table: TableCellVM) => (
      <div
        key={table.id}
        className={`
          w-2 h-2 rounded-sm
          ${table.status === 'completed' ? 'bg-ios-green' : 
            table.status === 'in_progress' ? 'bg-ios-yellow' : 
            table.status === 'skipped' ? 'bg-ios-gray' : 'bg-ios-gray-4'}
        `}
      />
    ),
    []
  );

  return (
    <div className={className}>
      <Grid
        items={tables}
        columns={columns}
        renderCell={renderCell}
        gap="none"
      />
    </div>
  );
}

/**
 * TableGridCompact - kompaktní verze pro menší obrazovky
 */
export function TableGridCompact({
  tables,
  columns,
  onTablePress,
  className = '',
}: Omit<TableGridProps, 'showLegend' | 'onTableLongPress' | 'isLoading'>) {
  const renderCell = useCallback(
    (table: TableCellVM) => (
      <GridCell
        key={table.id}
        id={table.id}
        label={table.label}
        status={mapWorkStatusToCellStatus(table.status)}
        isSelected={table.isSelected}
        onPress={onTablePress}
        size="sm"
      />
    ),
    [onTablePress]
  );

  return (
    <div className={`overflow-auto scrollbar-hide ${className}`}>
      <Grid
        items={tables}
        columns={columns}
        renderCell={renderCell}
        gap="none"
      />
    </div>
  );
}
