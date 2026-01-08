/**
 * MST Screen Component - 2026 Glassmorphism Edition
 * 
 * Modern screen layout with glass header.
 */

import React from 'react';

/**
 * Screen - full-screen layout wrapper
 */
export interface ScreenProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  padded?: boolean;
  scrollable?: boolean;
}

export function Screen({
  children,
  header,
  footer,
  className = '',
  contentClassName = '',
  padded = true,
  scrollable = true,
}: ScreenProps) {
  return (
    <div className={`h-full flex flex-col ${className}`}>
      {header}
      <main
        className={`
          flex-1 min-h-0
          ${scrollable ? 'overflow-y-auto scrollbar-hide' : 'overflow-hidden'}
          ${contentClassName}
        `}
      >
        {padded ? (
          <div className="px-4 pb-4">{children}</div>
        ) : (
          children
        )}
      </main>
      {footer}
    </div>
  );
}

/**
 * ScreenHeader - glass header with title
 */
export interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  largeTitle?: boolean;
  transparent?: boolean;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  className?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  largeTitle = false,
  transparent = false,
  leftAction,
  rightAction,
  className = '',
}: ScreenHeaderProps) {
  return (
    <header
      className={`
        safe-area-top
        ${transparent 
          ? 'bg-transparent' 
          : 'glass-panel'
        }
        ${className}
      `}
    >
      {/* Navigation bar */}
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Left action */}
        <div className="w-16 flex justify-start">
          {leftAction}
        </div>

        {/* Center title (small) */}
        {!largeTitle && title && (
          <div className="flex-1 text-center">
            <h1 className="font-semibold text-slate-900 dark:text-white truncate">
              {title}
            </h1>
          </div>
        )}

        {/* Right action */}
        <div className="w-16 flex justify-end">
          {rightAction}
        </div>
      </div>

      {/* Large title */}
      {largeTitle && title && (
        <div className="px-4 pb-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </header>
  );
}

/**
 * ScreenContent - scrollable content area
 */
export interface ScreenContentProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

export function ScreenContent({
  children,
  className = '',
  padded = true,
}: ScreenContentProps) {
  return (
    <div className={`${padded ? 'px-4 py-4' : ''} ${className}`}>
      {children}
    </div>
  );
}

/**
 * ScreenFooter - glass footer
 */
export interface ScreenFooterProps {
  children: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export function ScreenFooter({
  children,
  className = '',
  transparent = false,
}: ScreenFooterProps) {
  return (
    <footer
      className={`
        safe-area-bottom px-4 py-3
        ${transparent 
          ? 'bg-transparent' 
          : 'glass-panel border-t border-b-0'
        }
        ${className}
      `}
    >
      {children}
    </footer>
  );
}

/**
 * BackButton - standard back button
 */
export interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        flex items-center gap-1
        text-brand-600 dark:text-brand-400
        font-medium
        touch-feedback
      "
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      {label && <span>{label}</span>}
    </button>
  );
}

/**
 * PageTitle - standalone page title
 */
export interface PageTitleProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageTitle({ title, subtitle, action, className = '' }: PageTitleProps) {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * Section - content section with title
 */
export interface SectionProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, subtitle, action, children, className = '' }: SectionProps) {
  return (
    <section className={`mb-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * EmptyState - empty content placeholder
 */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default Screen;
