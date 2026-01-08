/**
 * MST List Components
 * 
 * iOS-style list a list items.
 */

import React from 'react';

/**
 * List - kontejner pro list items
 */
export interface ListProps {
  children: React.ReactNode;
  className?: string;
}

export function List({ children, className = '' }: ListProps) {
  return (
    <div className={`bg-white rounded-ios-lg shadow-ios overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

/**
 * ListItem - položka seznamu
 */
export interface ListItemProps {
  /** Primární text */
  title: string;
  /** Sekundární text */
  subtitle?: string;
  /** Levá ikona/avatar */
  left?: React.ReactNode;
  /** Pravá část (hodnota, šipka, badge) */
  right?: React.ReactNode;
  /** Zobrazit šipku */
  showChevron?: boolean;
  /** Kliknutí */
  onPress?: () => void;
  /** Je první položka */
  isFirst?: boolean;
  /** Je poslední položka */
  isLast?: boolean;
  /** Destructive styl */
  destructive?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

export function ListItem({
  title,
  subtitle,
  left,
  right,
  showChevron = false,
  onPress,
  isFirst = false,
  isLast = false,
  destructive = false,
  disabled = false,
  className = '',
}: ListItemProps) {
  const Component = onPress ? 'button' : 'div';

  return (
    <>
      <Component
        onClick={onPress}
        disabled={disabled}
        className={`
          w-full flex items-center gap-3
          px-4 py-3
          text-left
          ${onPress ? 'touch-feedback' : ''}
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
          ${isFirst ? 'rounded-t-ios-lg' : ''}
          ${isLast ? 'rounded-b-ios-lg' : ''}
          ${className}
        `}
      >
        {/* Left */}
        {left && <div className="flex-shrink-0">{left}</div>}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`
              text-ios-body truncate
              ${destructive ? 'text-ios-red' : 'text-gray-900'}
            `}
          >
            {title}
          </p>
          {subtitle && (
            <p className="text-ios-subhead text-ios-gray truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right */}
        {right && <div className="flex-shrink-0 text-ios-gray">{right}</div>}

        {/* Chevron */}
        {showChevron && (
          <svg
            className="w-5 h-5 text-ios-gray-3 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </Component>

      {/* Divider */}
      {!isLast && <div className="divider" />}
    </>
  );
}

/**
 * ListSection - sekce se záhlavím
 */
export interface ListSectionProps {
  title?: string;
  footer?: string;
  children: React.ReactNode;
  className?: string;
}

export function ListSection({
  title,
  footer,
  children,
  className = '',
}: ListSectionProps) {
  return (
    <div className={className}>
      {/* Header */}
      {title && (
        <h3 className="px-4 pb-1 text-ios-footnote text-ios-gray uppercase">
          {title}
        </h3>
      )}

      {/* List */}
      <List>{children}</List>

      {/* Footer */}
      {footer && (
        <p className="px-4 pt-1 text-ios-footnote text-ios-gray">{footer}</p>
      )}
    </div>
  );
}

/**
 * ListItemIcon - wrapper pro ikonu v list item
 */
export interface ListItemIconProps {
  icon: React.ReactNode;
  color?: string;
  bgColor?: string;
}

export function ListItemIcon({
  icon,
  color = 'text-white',
  bgColor = 'bg-ios-blue',
}: ListItemIconProps) {
  return (
    <div
      className={`
        w-7 h-7 rounded-md
        flex items-center justify-center
        ${bgColor} ${color}
      `}
    >
      {icon}
    </div>
  );
}

/**
 * ListItemValue - hodnota na pravé straně
 */
export interface ListItemValueProps {
  children: React.ReactNode;
  className?: string;
}

export function ListItemValue({ children, className = '' }: ListItemValueProps) {
  return (
    <span className={`text-ios-body text-ios-gray ${className}`}>{children}</span>
  );
}

/**
 * Separator - oddělující mezera mezi sekcemi
 */
export function ListSeparator({ height = 'md' }: { height?: 'sm' | 'md' | 'lg' }) {
  const heights = {
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-12',
  };

  return <div className={heights[height]} />;
}

/**
 * Toggle - iOS style switch/toggle
 */
export interface ToggleProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
}: ToggleProps) {
  const sizes = {
    sm: {
      track: 'w-10 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-12 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-5',
    },
  };

  const s = sizes[size];

  return (
    <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={`
          ${s.track}
          rounded-full
          transition-colors duration-200
          ${checked
            ? 'bg-success-500'
            : 'bg-slate-200 dark:bg-slate-700'
          }
        `}
      >
        <div
          className={`
            ${s.thumb}
            bg-white
            rounded-full
            shadow-md
            transition-transform duration-200
            absolute top-0.5 left-0.5
            ${checked ? s.translate : 'translate-x-0'}
          `}
        />
      </div>
    </label>
  );
}
