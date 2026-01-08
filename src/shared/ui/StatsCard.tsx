/**
 * MST StatsCard Component - 2026 Edition
 * 
 * Animované statistické karty s gradienty a efekty.
 */

import React, { useEffect, useState } from 'react';

export interface StatsCardProps {
  /** Název statistiky */
  label: string;
  /** Hodnota */
  value: number | string;
  /** Formátovací funkce */
  format?: (value: number) => string;
  /** Změna (např. +12%) */
  change?: {
    value: number;
    label?: string;
  };
  /** Ikona */
  icon?: React.ReactNode;
  /** Barva */
  color?: 'brand' | 'success' | 'warning' | 'error' | 'accent';
  /** Varianta */
  variant?: 'default' | 'gradient' | 'glass' | 'outline';
  /** Velikost */
  size?: 'sm' | 'md' | 'lg';
  /** Animovat číslo při změně */
  animated?: boolean;
  /** onClick handler */
  onClick?: () => void;
}

const colorStyles: Record<string, { gradient: string; icon: string; badge: string }> = {
  brand: {
    gradient: 'from-brand-500 to-brand-600',
    icon: 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
    badge: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  },
  success: {
    gradient: 'from-success-500 to-success-600',
    icon: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
    badge: 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
  },
  warning: {
    gradient: 'from-warning-500 to-warning-600',
    icon: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
    badge: 'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
  },
  error: {
    gradient: 'from-error-500 to-error-600',
    icon: 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400',
    badge: 'bg-error-100 text-error-700 dark:bg-error-900/40 dark:text-error-300',
  },
  accent: {
    gradient: 'from-accent-500 to-accent-600',
    icon: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400',
    badge: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
  },
};

const sizeStyles = {
  sm: {
    padding: 'p-4',
    iconSize: 'w-10 h-10',
    iconInner: 'w-5 h-5',
    labelSize: 'text-xs',
    valueSize: 'text-xl',
    changeSize: 'text-xs',
  },
  md: {
    padding: 'p-5',
    iconSize: 'w-12 h-12',
    iconInner: 'w-6 h-6',
    labelSize: 'text-sm',
    valueSize: 'text-2xl',
    changeSize: 'text-sm',
  },
  lg: {
    padding: 'p-6',
    iconSize: 'w-14 h-14',
    iconInner: 'w-7 h-7',
    labelSize: 'text-base',
    valueSize: 'text-3xl',
    changeSize: 'text-base',
  },
};

// Animace čísla
function useAnimatedNumber(target: number, duration = 1000): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = current;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setCurrent(Math.round(startValue + (target - startValue) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return current;
}

export function StatsCard({
  label,
  value,
  format,
  change,
  icon,
  color = 'brand',
  variant = 'default',
  size = 'md',
  animated = true,
  onClick,
}: StatsCardProps) {
  const colors = colorStyles[color];
  const sizes = sizeStyles[size];
  
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const displayValue = animated && typeof value === 'number'
    ? useAnimatedNumber(numericValue)
    : numericValue;
  
  const formattedValue = format 
    ? format(displayValue) 
    : typeof value === 'number' 
      ? displayValue.toLocaleString('cs-CZ')
      : value;

  const variantStyles = {
    default: `
      bg-white dark:bg-slate-800
      border border-slate-200/50 dark:border-slate-700/50
      shadow-card
    `,
    gradient: `
      bg-gradient-to-br ${colors.gradient}
      text-white
      shadow-lg
    `,
    glass: `
      bg-white/60 dark:bg-slate-800/60
      backdrop-blur-glass
      border border-white/30 dark:border-slate-700/50
      shadow-glass
    `,
    outline: `
      bg-transparent
      border-2 border-slate-200 dark:border-slate-700
    `,
  };

  const isGradient = variant === 'gradient';

  return (
    <div
      onClick={onClick}
      className={`
        ${sizes.padding}
        rounded-2xl
        ${variantStyles[variant]}
        ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
        transition-all duration-200
      `}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        {icon && (
          <div 
            className={`
              ${sizes.iconSize} 
              rounded-xl 
              flex items-center justify-center
              ${isGradient ? 'bg-white/20' : colors.icon}
            `}
          >
            <div className={sizes.iconInner}>
              {icon}
            </div>
          </div>
        )}

        {/* Change badge */}
        {change && (
          <div 
            className={`
              px-2 py-1 rounded-lg ${sizes.changeSize} font-medium
              ${isGradient 
                ? 'bg-white/20 text-white' 
                : change.value >= 0 
                  ? 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300'
                  : 'bg-error-100 text-error-700 dark:bg-error-900/40 dark:text-error-300'
              }
            `}
          >
            {change.value >= 0 ? '↑' : '↓'} {Math.abs(change.value)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className={`mt-4 ${sizes.valueSize} font-bold ${isGradient ? '' : 'text-slate-900 dark:text-white'}`}>
        {formattedValue}
      </div>

      {/* Label */}
      <div className={`mt-1 ${sizes.labelSize} ${isGradient ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
        {label}
        {change?.label && (
          <span className="ml-1 opacity-70">({change.label})</span>
        )}
      </div>
    </div>
  );
}

/**
 * Grid pro stats cards
 */
export interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function StatsGrid({ children, columns = 2 }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {children}
    </div>
  );
}

export default StatsCard;
