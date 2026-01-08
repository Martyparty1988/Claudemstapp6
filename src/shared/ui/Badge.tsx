/**
 * MST Badge & Chip Components
 * 
 * Status badges a selectable chips.
 */

import React from 'react';

/**
 * Badge - status indikátor
 */
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-ios-gray-5 text-ios-gray',
  primary: 'bg-ios-blue/10 text-ios-blue',
  success: 'bg-ios-green/10 text-ios-green',
  warning: 'bg-ios-orange/10 text-ios-orange',
  danger: 'bg-ios-red/10 text-ios-red',
  info: 'bg-blue-100 text-blue-700',
};

const badgeSizes: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-ios-caption2',
  md: 'px-2 py-1 text-ios-caption1',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-medium rounded-full
        ${badgeVariants[variant]}
        ${badgeSizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

/**
 * StatusBadge - badge pro work status
 */
export type WorkStatusType = 'pending' | 'in-progress' | 'completed' | 'skipped';

export interface StatusBadgeProps {
  status: WorkStatusType;
  size?: BadgeSize;
  className?: string;
}

const statusConfig: Record<WorkStatusType, { label: string; variant: BadgeVariant }> = {
  'pending': { label: 'Čeká', variant: 'default' },
  'in-progress': { label: 'Probíhá', variant: 'warning' },
  'completed': { label: 'Hotovo', variant: 'success' },
  'skipped': { label: 'Přeskočeno', variant: 'default' },
};

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  );
}

/**
 * Chip - selectable chip
 */
export interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  className?: string;
}

export function Chip({
  children,
  selected = false,
  onPress,
  disabled = false,
  leftIcon,
  className = '',
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1.5
        rounded-full
        text-ios-subhead font-medium
        transition-all duration-150
        touch-feedback
        ${
          selected
            ? 'bg-ios-blue text-white'
            : 'bg-ios-gray-5 text-gray-900 active:bg-ios-gray-4'
        }
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
        ${className}
      `}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
    </button>
  );
}

/**
 * ChipGroup - skupina chips
 */
export interface ChipOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface ChipGroupProps {
  options: readonly ChipOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ChipGroup({
  options,
  value,
  onChange,
  className = '',
}: ChipGroupProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => (
        <Chip
          key={option.value}
          selected={value === option.value}
          onPress={() => onChange(option.value)}
          leftIcon={option.icon}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  );
}

/**
 * ProgressBadge - badge s progress barem
 */
export interface ProgressBadgeProps {
  value: number; // 0-100
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function ProgressBadge({
  value,
  label,
  size = 'md',
  className = '',
}: ProgressBadgeProps) {
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
  };

  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-ios-caption1 text-ios-gray">{label}</span>
          <span className="text-ios-caption1 font-medium text-gray-900">
            {clampedValue}%
          </span>
        </div>
      )}
      <div className={`w-full bg-ios-gray-4 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full bg-ios-green rounded-full transition-all duration-300`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

/**
 * CountBadge - číselný badge (např. pro notifikace)
 */
export interface CountBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

export function CountBadge({ count, max = 99, className = '' }: CountBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[20px] h-5 px-1.5
        bg-ios-red text-white
        text-ios-caption2 font-semibold
        rounded-full
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
}
