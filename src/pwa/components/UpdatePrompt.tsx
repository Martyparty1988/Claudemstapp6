/**
 * MST UpdatePrompt Component
 * 
 * Prompt pro aktualizaci aplikace.
 */

import React from 'react';
import { Button } from '../../shared';

/**
 * Props
 */
export interface UpdatePromptProps {
  /** Je aktualizace dostupná */
  isUpdateAvailable: boolean;
  /** Callback pro aktualizaci */
  onUpdate: () => void;
  /** Callback pro zavření */
  onDismiss?: () => void;
  /** Custom className */
  className?: string;
}

/**
 * UpdatePrompt Component
 */
export function UpdatePrompt({
  isUpdateAvailable,
  onUpdate,
  onDismiss,
  className = '',
}: UpdatePromptProps) {
  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <div
      className={`
        fixed bottom-20 left-4 right-4 z-50
        bg-white rounded-ios-lg shadow-ios-sheet
        p-4
        animate-fade-in
        safe-area-bottom
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-ios-blue/10 flex items-center justify-center flex-shrink-0">
          <UpdateIcon />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-ios-headline text-gray-900">Nová verze dostupná</h4>
          <p className="text-ios-subhead text-ios-gray mt-1">
            Aktualizujte aplikaci pro nejnovější funkce a opravy.
          </p>
        </div>

        {/* Dismiss */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-ios-gray touch-target touch-feedback"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {onDismiss && (
          <Button
            variant="secondary"
            size="md"
            onClick={onDismiss}
            className="flex-1"
          >
            Později
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          onClick={onUpdate}
          className="flex-1"
        >
          Aktualizovat
        </Button>
      </div>
    </div>
  );
}

/**
 * UpdatePromptMinimal - minimální verze v headeru
 */
export function UpdatePromptMinimal({
  isUpdateAvailable,
  onUpdate,
}: Pick<UpdatePromptProps, 'isUpdateAvailable' | 'onUpdate'>) {
  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <button
      onClick={onUpdate}
      className="flex items-center gap-1 text-ios-blue text-ios-footnote font-medium touch-feedback"
    >
      <UpdateIcon className="w-4 h-4" />
      <span>Aktualizovat</span>
    </button>
  );
}

/**
 * Icons
 */
function UpdateIcon({ className = 'w-5 h-5 text-ios-blue' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
