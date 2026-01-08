/**
 * MST Error Components
 * 
 * Error state a empty state komponenty.
 */

import React from 'react';
import { Button, TextButton } from './Button';

/**
 * ErrorState - zobrazení chyby
 */
export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Něco se pokazilo',
  message,
  onRetry,
  retryLabel = 'Zkusit znovu',
  icon,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      {/* Icon */}
      <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-ios-red/10">
        {icon ?? (
          <svg
            className="w-8 h-8 text-ios-red"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )}
      </div>

      {/* Title */}
      <h3 className="text-ios-headline text-gray-900 mb-1">{title}</h3>

      {/* Message */}
      <p className="text-ios-subhead text-ios-gray mb-4 max-w-xs">{message}</p>

      {/* Retry button */}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * EmptyState - prázdný stav
 */
export interface EmptyStateProps {
  title: string;
  /** @deprecated Use description instead */
  message?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title,
  message,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  const text = description ?? message;
  return (
    <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
      {/* Icon */}
      <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-ios-gray-5">
        {icon ?? (
          <svg
            className="w-8 h-8 text-ios-gray"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>

      {/* Title */}
      <h3 className="text-ios-headline text-gray-900 mb-1">{title}</h3>

      {/* Message */}
      {text && (
        <p className="text-ios-subhead text-ios-gray mb-4 max-w-xs">{text}</p>
      )}

      {/* Action */}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}

/**
 * ErrorBanner - inline error banner
 */
export interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorBanner({
  message,
  onDismiss,
  className = '',
}: ErrorBannerProps) {
  return (
    <div
      className={`
        flex items-center gap-3 p-3
        bg-ios-red/10 rounded-ios-lg
        ${className}
      `}
    >
      <svg
        className="w-5 h-5 text-ios-red flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <p className="flex-1 text-ios-footnote text-ios-red">{message}</p>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 text-ios-red touch-target"
          aria-label="Zavřít"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * SuccessBanner - inline success banner
 */
export interface SuccessBannerProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function SuccessBanner({
  message,
  onDismiss,
  className = '',
}: SuccessBannerProps) {
  return (
    <div
      className={`
        flex items-center gap-3 p-3
        bg-ios-green/10 rounded-ios-lg
        ${className}
      `}
    >
      <svg
        className="w-5 h-5 text-ios-green flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <p className="flex-1 text-ios-footnote text-ios-green">{message}</p>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 text-ios-green touch-target"
          aria-label="Zavřít"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
