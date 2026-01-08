/**
 * MST Card Component - 2026 Glassmorphism Edition
 * 
 * Modern glass cards with beautiful effects.
 */

import React from 'react';

export type CardVariant = 'glass' | 'solid' | 'outline' | 'gradient';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
  onPress?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  glass: `
    bg-white/70 dark:bg-slate-800/70
    backdrop-blur-glass
    border border-white/30 dark:border-slate-700/50
    shadow-glass
  `,
  solid: `
    bg-white dark:bg-slate-800
    border border-slate-200 dark:border-slate-700
    shadow-card
  `,
  outline: `
    bg-transparent
    border border-slate-200 dark:border-slate-700
  `,
  gradient: `
    bg-gradient-to-br from-white/80 to-white/40 
    dark:from-slate-800/80 dark:to-slate-800/40
    backdrop-blur-glass
    border border-white/40 dark:border-slate-700/50
    shadow-glass
  `,
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

/**
 * Card component
 */
export function Card({
  children,
  variant = 'glass',
  padding = 'md',
  hover = false,
  glow = false,
  className = '',
  onClick,
  onPress,
}: CardProps) {
  const handleClick = onClick || onPress;
  const isClickable = !!handleClick;

  return (
    <div
      className={`
        rounded-2xl
        transition-all duration-300 ease-smooth
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hover ? 'hover:-translate-y-1 hover:shadow-card-hover' : ''}
        ${glow ? 'glow' : ''}
        ${isClickable ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `}
      onClick={handleClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {children}
    </div>
  );
}

/**
 * GradientCard - card with gradient border
 */
export interface GradientCardProps extends Omit<CardProps, 'variant'> {
  gradient?: 'brand' | 'success' | 'sunset' | 'ocean';
}

export function GradientCard({
  children,
  gradient = 'brand',
  padding = 'md',
  className = '',
  onClick,
}: GradientCardProps) {
  const gradients = {
    brand: 'from-brand-500 to-accent-500',
    success: 'from-success-500 to-cyan-500',
    sunset: 'from-error-500 to-warning-500',
    ocean: 'from-blue-500 to-violet-500',
  };

  return (
    <div
      className={`
        relative p-[1px] rounded-2xl
        bg-gradient-to-br ${gradients[gradient]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className={`
        bg-white dark:bg-slate-900 rounded-2xl
        ${paddingStyles[padding]}
      `}>
        {children}
      </div>
    </div>
  );
}

/**
 * FeatureCard - card for features/stats
 */
export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  value?: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
  gradient?: 'brand' | 'success' | 'warning' | 'error';
  onClick?: () => void;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  value,
  trend,
  gradient = 'brand',
  onClick,
  className = '',
}: FeatureCardProps) {
  const gradients = {
    brand: 'from-brand-500 to-brand-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    error: 'from-error-500 to-error-600',
  };

  const glows = {
    brand: 'shadow-glass-glow',
    success: 'shadow-glass-glow-success',
    warning: 'shadow-[0_0_40px_rgba(245,158,11,0.3)]',
    error: 'shadow-[0_0_40px_rgba(244,63,94,0.3)]',
  };

  return (
    <Card
      variant="glass"
      padding="md"
      hover
      onClick={onClick}
      className={`${onClick ? glows[gradient] : ''} ${className}`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`
          w-12 h-12 rounded-xl
          bg-gradient-to-br ${gradients[gradient]}
          flex items-center justify-center
          text-white shadow-lg
        `}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          
          {value !== undefined && (
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {value}
            </p>
          )}
          
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {description}
            </p>
          )}

          {trend && (
            <div className={`
              inline-flex items-center gap-1 mt-2
              text-sm font-medium
              ${trend.positive ? 'text-success-600' : 'text-error-600'}
            `}>
              <TrendIcon positive={trend.positive} />
              {trend.value}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * ActionCard - card with action button
 */
export interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ActionCard({
  icon,
  title,
  subtitle,
  action,
  onClick,
  className = '',
}: ActionCardProps) {
  return (
    <Card
      variant="glass"
      padding="md"
      hover={!!onClick}
      onClick={onClick}
      className={className}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-600 dark:text-slate-300">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white">
            {title}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action or arrow */}
        {action || (onClick && (
          <ChevronIcon className="w-5 h-5 text-slate-400" />
        ))}
      </div>
    </Card>
  );
}

/**
 * StatCard - compact stat display
 */
export interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'brand' | 'success' | 'warning' | 'error' | 'muted';
  className?: string;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  color = 'brand',
  className = '',
}: StatCardProps) {
  const colors = {
    brand: 'text-brand-600 dark:text-brand-400',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    error: 'text-error-600 dark:text-error-400',
    muted: 'text-slate-600 dark:text-slate-400',
  };

  const iconBgs = {
    brand: 'bg-brand-100 dark:bg-brand-900/30',
    success: 'bg-success-100 dark:bg-success-900/30',
    warning: 'bg-warning-100 dark:bg-warning-900/30',
    error: 'bg-error-100 dark:bg-error-900/30',
    muted: 'bg-slate-100 dark:bg-slate-800',
  };

  return (
    <Card variant="glass" padding="md" className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {icon && (
          <div className={`w-8 h-8 rounded-lg ${iconBgs[color]} ${colors[color]} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold ${colors[color]}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {subtitle}
        </p>
      )}
    </Card>
  );
}

/**
 * CardHeader
 */
export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between ${className}`}>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * Helper icons
 */
function TrendIcon({ positive }: { positive: boolean }) {
  if (positive) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l9.2-9.2M17 17V7H7" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-9.2 9.2M7 7v10h10" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default Card;
