/**
 * MST InstallPrompt Component
 * 
 * Prompt pro instalaci PWA.
 */

import React, { useState } from 'react';
import { Button, BottomSheet, BottomSheetContent } from '../../shared';

/**
 * Props
 */
export interface InstallPromptProps {
  /** Lze nainstalovat */
  canInstall: boolean;
  /** Je již nainstalováno */
  isInstalled: boolean;
  /** Callback pro instalaci */
  onInstall: () => Promise<boolean>;
  /** Custom className */
  className?: string;
}

/**
 * InstallPrompt Component - bottom sheet styl
 */
export function InstallPrompt({
  canInstall,
  isInstalled,
  onInstall,
  className = '',
}: InstallPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Nezobrazovat pokud nelze instalovat, je instalováno, nebo bylo zavřeno
  if (!canInstall || isInstalled || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const result = await onInstall();
    if (result) {
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`
            fixed bottom-24 right-4 z-40
            w-14 h-14 rounded-full
            bg-ios-blue text-white
            shadow-ios-sheet
            flex items-center justify-center
            touch-feedback
            animate-fade-in
            ${className}
          `}
        >
          <InstallIcon />
        </button>
      )}

      {/* Install sheet */}
      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        height="auto"
        showHandle
      >
        <BottomSheetContent>
          <div className="text-center py-4">
            {/* App icon */}
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-ios-blue to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">MST</span>
            </div>

            {/* Title */}
            <h3 className="text-ios-title2 font-semibold text-gray-900 mb-2">
              Nainstalovat MST
            </h3>

            {/* Description */}
            <p className="text-ios-subhead text-ios-gray mb-6 max-w-xs mx-auto">
              Přidejte aplikaci na domovskou obrazovku pro rychlejší přístup a lepší offline podporu.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <FeatureItem icon="⚡" text="Rychlejší načítání" />
              <FeatureItem icon="📴" text="Funguje offline" />
              <FeatureItem icon="🔔" text="Push notifikace" />
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleInstall}
              >
                Nainstalovat
              </Button>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={handleDismiss}
              >
                Teď ne
              </Button>
            </div>
          </div>
        </BottomSheetContent>
      </BottomSheet>
    </>
  );
}

/**
 * Feature item helper
 */
function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 text-left">
      <span className="text-xl">{icon}</span>
      <span className="text-ios-body text-gray-700">{text}</span>
    </div>
  );
}

/**
 * InstallBanner - inline banner verze
 */
export function InstallBanner({
  canInstall,
  isInstalled,
  onInstall,
}: InstallPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!canInstall || isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="bg-ios-blue/10 rounded-ios-lg p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-ios-blue flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-white">MST</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-ios-subhead font-medium text-gray-900">
          Nainstalovat aplikaci
        </p>
        <p className="text-ios-caption1 text-ios-gray">
          Rychlejší přístup z domovské obrazovky
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsDismissed(true)}
          className="text-ios-gray p-2 touch-feedback"
        >
          <CloseIcon />
        </button>
        <button
          onClick={onInstall}
          className="text-ios-blue font-medium text-ios-subhead touch-feedback"
        >
          Instalovat
        </button>
      </div>
    </div>
  );
}

/**
 * Icons
 */
function InstallIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
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
