/**
 * MST Modal Component - 2026 Glassmorphism Edition
 * 
 * Modern modal dialogs with glass effects.
 */

import React, { useEffect, useCallback } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  size?: ModalSize;
  showClose?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

/**
 * Modal component
 */
export function Modal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  size = 'md',
  showClose = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
}: ModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Modal content */}
      <div
        className={`
          relative w-full ${sizeStyles[size]}
          bg-white/90 dark:bg-slate-900/90
          backdrop-blur-glass-lg
          border border-white/30 dark:border-slate-700/50
          rounded-3xl
          shadow-glass-xl
          animate-scale-in
          ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between p-6 pb-0">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-bold text-slate-900 dark:text-white"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="
                  w-8 h-8 -mr-2 -mt-2
                  flex items-center justify-center
                  rounded-xl
                  text-slate-400 hover:text-slate-600
                  dark:text-slate-500 dark:hover:text-slate-300
                  hover:bg-slate-100 dark:hover:bg-slate-800
                  transition-colors
                "
                aria-label="Zavřít"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/**
 * ModalHeader - header with title and close button
 */
export interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  className?: string;
}

export function ModalHeader({ title, subtitle, onClose, className = '' }: ModalHeaderProps) {
  return (
    <div className={`flex items-start justify-between p-6 pb-4 ${className}`}>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="
            w-8 h-8 -mr-2 -mt-2
            flex items-center justify-center
            rounded-xl
            text-slate-400 hover:text-slate-600
            dark:text-slate-500 dark:hover:text-slate-300
            hover:bg-slate-100 dark:hover:bg-slate-800
            transition-colors
          "
          aria-label="Zavřít"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

/**
 * ModalContent - scrollable content area
 */
export interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalContent({ children, className = '' }: ModalContentProps) {
  return (
    <div className={`px-6 pb-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * ModalFooter - footer with actions
 */
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div
      className={`
        flex items-center justify-end gap-3
        pt-4 mt-2
        border-t border-slate-200/50 dark:border-slate-700/50
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * AlertModal - simple alert dialog
 */
export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'info' | 'warning' | 'danger';
}

export function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Zrušit',
  variant = 'info',
}: AlertModalProps) {
  const variantStyles = {
    info: {
      icon: 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400',
      button: 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700',
    },
    warning: {
      icon: 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400',
      button: 'bg-gradient-to-r from-warning-500 to-warning-600 hover:from-warning-600 hover:to-warning-700',
    },
    danger: {
      icon: 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400',
      button: 'bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="text-center">
        {/* Icon */}
        <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl ${styles.icon} flex items-center justify-center`}>
          {variant === 'info' && <InfoIcon className="w-7 h-7" />}
          {variant === 'warning' && <WarningIcon className="w-7 h-7" />}
          {variant === 'danger' && <DangerIcon className="w-7 h-7" />}
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          {onConfirm && (
            <button
              onClick={onClose}
              className="
                flex-1 h-11 px-4
                bg-slate-100 dark:bg-slate-800
                text-slate-700 dark:text-slate-300
                font-medium rounded-xl
                hover:bg-slate-200 dark:hover:bg-slate-700
                transition-colors
              "
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className={`
              flex-1 h-11 px-4
              ${styles.button}
              text-white font-semibold rounded-xl
              transition-all active:scale-[0.98]
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Icons
 */
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function DangerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

export default Modal;
