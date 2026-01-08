/**
 * MST Grid Components
 * 
 * Grid a GridCell pro zobrazení mřížky stolů.
 * HLOUPÉ komponenty - neznají business logiku.
 */

import React, { useMemo, useCallback } from 'react';

/**
 * Status barvy pro buňky
 */
export type CellStatus = 'pending' | 'in-progress' | 'completed' | 'skipped';

const statusColors: Record<CellStatus, string> = {
  'pending': 'bg-ios-gray-5',
  'in-progress': 'bg-ios-yellow',
  'completed': 'bg-ios-green',
  'skipped': 'bg-ios-gray',
};

const statusSelectedColors: Record<CellStatus, string> = {
  'pending': 'bg-ios-gray-4 ring-2 ring-ios-blue',
  'in-progress': 'bg-yellow-400 ring-2 ring-ios-blue',
  'completed': 'bg-green-400 ring-2 ring-ios-blue',
  'skipped': 'bg-gray-400 ring-2 ring-ios-blue',
};

/**
 * GridCell props
 */
export interface GridCellProps {
  /** Unikátní ID buňky */
  id: string;
  /** Label zobrazený v buňce */
  label: string;
  /** Status buňky (určuje barvu) */
  status: CellStatus;
  /** Je buňka vybraná */
  isSelected?: boolean;
  /** Callback při kliknutí */
  onPress?: (id: string) => void;
  /** Callback při long press */
  onLongPress?: (id: string) => void;
  /** Velikost buňky */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

/**
 * GridCell - jednotlivá buňka v mřížce
 */
export function GridCell({
  id,
  label,
  status,
  isSelected = false,
  onPress,
  onLongPress,
  size = 'md',
  className = '',
}: GridCellProps) {
  const sizeClasses = {
    sm: 'min-w-[32px] min-h-[32px] text-ios-caption2',
    md: 'min-w-[44px] min-h-[44px] text-ios-caption1',
    lg: 'min-w-[56px] min-h-[56px] text-ios-footnote',
  };

  const handleClick = useCallback(() => {
    onPress?.(id);
  }, [id, onPress]);

  // Long press handling
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback(() => {
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress(id);
      }, 500);
    }
  }, [id, onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const colorClass = isSelected
    ? statusSelectedColors[status]
    : statusColors[status];

  return (
    <button
      type="button"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`
        flex items-center justify-center
        rounded-ios
        font-medium
        transition-all duration-100
        active:scale-95
        ${sizeClasses[size]}
        ${colorClass}
        ${className}
      `}
      aria-pressed={isSelected}
      aria-label={`Stůl ${label}, ${status}`}
    >
      {label}
    </button>
  );
}

/**
 * Grid props
 */
export interface GridProps<T extends { id: string }> {
  /** Data pro buňky */
  items: readonly T[];
  /** Počet sloupců */
  columns: number;
  /** Render funkce pro buňku */
  renderCell: (item: T, index: number) => React.ReactNode;
  /** Gap mezi buňkami */
  gap?: 'none' | 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

/**
 * Grid - mřížka buněk
 */
export function Grid<T extends { id: string }>({
  items,
  columns,
  renderCell,
  gap = 'sm',
  className = '',
}: GridProps<T>) {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3',
  };

  return (
    <div
      className={`
        grid
        ${gapClasses[gap]}
        ${className}
      `}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {renderCell(item, index)}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * ScrollableGrid - grid se scrollováním
 */
export interface ScrollableGridProps<T extends { id: string }> extends GridProps<T> {
  /** Maximální výška */
  maxHeight?: string;
}

export function ScrollableGrid<T extends { id: string }>({
  maxHeight = '100%',
  className = '',
  ...props
}: ScrollableGridProps<T>) {
  return (
    <div
      className={`overflow-auto scrollbar-hide ${className}`}
      style={{ maxHeight }}
    >
      <Grid {...props} />
    </div>
  );
}

/**
 * GridOverlay - overlay přes grid (např. pro loading)
 */
export interface GridOverlayProps {
  visible: boolean;
  children?: React.ReactNode;
}

export function GridOverlay({ visible, children }: GridOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
      {children}
    </div>
  );
}

/**
 * GridLegend - legenda pro barvy
 */
export interface GridLegendItem {
  status: CellStatus;
  label: string;
}

export interface GridLegendProps {
  items: readonly GridLegendItem[];
  className?: string;
}

export function GridLegend({ items, className = '' }: GridLegendProps) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {items.map((item) => (
        <div key={item.status} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded-sm ${statusColors[item.status]}`} />
          <span className="text-ios-caption1 text-ios-gray">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Default legend items
 */
export const DEFAULT_GRID_LEGEND: readonly GridLegendItem[] = [
  { status: 'pending', label: 'Čeká' },
  { status: 'in-progress', label: 'Probíhá' },
  { status: 'completed', label: 'Hotovo' },
  { status: 'skipped', label: 'Přeskočeno' },
];
