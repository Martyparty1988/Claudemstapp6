/**
 * MST Button Component - 2026 Glassmorphism Edition
 * 
 * Modern, vibrant buttons with glass effects and gradients.
 */

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  glow?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-brand-500 to-brand-600
    hover:from-brand-600 hover:to-brand-700
    text-white font-semibold
    shadow-button hover:shadow-button-hover
    active:from-brand-700 active:to-brand-800
  `,
  secondary: `
    bg-white/70 dark:bg-slate-800/70
    backdrop-blur-glass
    border border-slate-200/50 dark:border-slate-700/50
    text-slate-700 dark:text-slate-200 font-medium
    hover:bg-white/90 dark:hover:bg-slate-800/90
    hover:border-slate-300/50 dark:hover:border-slate-600/50
    shadow-card hover:shadow-card-hover
  `,
  ghost: `
    bg-transparent
    text-slate-600 dark:text-slate-300 font-medium
    hover:bg-slate-100/50 dark:hover:bg-slate-800/50
    active:bg-slate-200/50 dark:active:bg-slate-700/50
  `,
  danger: `
    bg-gradient-to-r from-error-500 to-error-600
    hover:from-error-600 hover:to-error-700
    text-white font-semibold
    shadow-[0_2px_8px_rgba(244,63,94,0.3)]
    hover:shadow-[0_4px_16px_rgba(244,63,94,0.4)]
  `,
  success: `
    bg-gradient-to-r from-success-500 to-success-600
    hover:from-success-600 hover:to-success-700
    text-white font-semibold
    shadow-[0_2px_8px_rgba(16,185,129,0.3)]
    hover:shadow-[0_4px_16px_rgba(16,185,129,0.4)]
  `,
  glass: `
    bg-white/60 dark:bg-slate-800/60
    backdrop-blur-glass
    border border-white/30 dark:border-slate-700/50
    text-slate-700 dark:text-slate-200 font-medium
    hover:bg-white/80 dark:hover:bg-slate-800/80
    shadow-glass
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-5 text-base rounded-xl gap-2',
  lg: 'h-13 px-6 text-lg rounded-xl gap-2.5',
  xl: 'h-14 px-8 text-lg rounded-2xl gap-3',
};

const iconSizes: Record<ButtonSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

/**
 * Button component
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  glow = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        relative inline-flex items-center justify-center
        transition-all duration-200 ease-smooth
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${glow && !isDisabled ? 'glow' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size={size} />
      ) : (
        <>
          {leftIcon && <span className={`flex-shrink-0 ${iconSizes[size]}`}>{leftIcon}</span>}
          {children}
          {rightIcon && <span className={`flex-shrink-0 ${iconSizes[size]}`}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

/**
 * IconButton - circular icon button
 */
export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: React.ReactNode;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  glow?: boolean;
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  loading,
  className = '',
  ...props
}: IconButtonProps) {
  const buttonSizes: Record<ButtonSize, string> = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-13 h-13',
    xl: 'w-14 h-14',
  };

  return (
    <button
      aria-label={label}
      className={`
        inline-flex items-center justify-center
        rounded-xl
        transition-all duration-200 ease-smooth
        active:scale-[0.95]
        ${variantStyles[variant]}
        ${buttonSizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? <LoadingSpinner size={size} /> : <span className={iconSizes[size]}>{icon}</span>}
    </button>
  );
}

/**
 * GradientButton - vibrant gradient button with glow
 */
export interface GradientButtonProps extends Omit<ButtonProps, 'variant'> {
  gradient?: 'brand' | 'success' | 'sunset' | 'ocean';
}

export function GradientButton({
  gradient = 'brand',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  children,
  ...props
}: GradientButtonProps) {
  const gradients = {
    brand: 'from-brand-500 to-accent-500 shadow-glass-glow hover:shadow-glass-glow-accent',
    success: 'from-success-500 to-cyan-500 shadow-glass-glow-success',
    sunset: 'from-error-500 to-warning-500',
    ocean: 'from-blue-500 to-violet-500',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        relative inline-flex items-center justify-center
        bg-gradient-to-r ${gradients[gradient]}
        text-white font-semibold
        transition-all duration-300 ease-smooth
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {/* Shine effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      
      {loading ? (
        <LoadingSpinner size={size} />
      ) : (
        <>
          {leftIcon && <span className={`flex-shrink-0 ${iconSizes[size]}`}>{leftIcon}</span>}
          <span className="relative">{children}</span>
          {rightIcon && <span className={`flex-shrink-0 ${iconSizes[size]}`}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

/**
 * TextButton - minimal text button
 */
export interface TextButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'brand' | 'error' | 'muted';
  size?: 'sm' | 'md' | 'lg';
}

export function TextButton({
  color = 'brand',
  size = 'md',
  disabled,
  className = '',
  children,
  ...props
}: TextButtonProps) {
  const colors = {
    brand: 'text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300',
    error: 'text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300',
    muted: 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
  };

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <button
      className={`
        font-medium
        transition-colors duration-200
        touch-target touch-feedback
        disabled:opacity-50
        ${colors[color]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Loading spinner
 */
function LoadingSpinner({ size }: { size: ButtonSize }) {
  const sizes: Record<ButtonSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-6 h-6',
  };

  return (
    <svg
      className={`animate-spin ${sizes[size]}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
