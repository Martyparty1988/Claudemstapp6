/**
 * MST BottomSheet Component
 * 
 * iOS-style bottom sheet s swipe-to-close.
 * Klíčová komponenta pro FieldMap workflow.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

export interface BottomSheetProps {
  /** Je sheet otevřený */
  isOpen: boolean;
  /** Callback pro zavření */
  onClose: () => void;
  /** Obsah sheetu */
  children: React.ReactNode;
  /** Titulek */
  title?: string;
  /** Výška sheetu */
  height?: 'auto' | 'half' | 'full';
  /** Zobrazit handle */
  showHandle?: boolean;
  /** Zakázat swipe-to-close */
  disableSwipe?: boolean;
  /** Zakázat zavření kliknutím na overlay */
  disableOverlayClose?: boolean;
}

const SWIPE_THRESHOLD = 100; // px pro zavření
const VELOCITY_THRESHOLD = 0.5; // px/ms

/**
 * BottomSheet component
 */
export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  height = 'auto',
  showHandle = true,
  disableSwipe = false,
  disableOverlayClose = false,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ y: number; time: number } | null>(null);

  // Height classes
  const heightClasses = {
    auto: 'max-h-[85vh]',
    half: 'h-[50vh]',
    full: 'h-[95vh]',
  };

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disableSwipe) return;
    
    const touch = e.touches[0];
    dragStartRef.current = { y: touch.clientY, time: Date.now() };
    setIsDragging(true);
  }, [disableSwipe]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragStartRef.current || disableSwipe) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStartRef.current.y;

    // Pouze dolů
    if (deltaY > 0) {
      setTranslateY(deltaY);
    }
  }, [disableSwipe]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!dragStartRef.current || disableSwipe) return;

    const endTime = Date.now();
    const duration = endTime - dragStartRef.current.time;
    const velocity = translateY / duration;

    // Zavřít pokud překročí threshold nebo má vysokou rychlost
    if (translateY > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      onClose();
    }

    // Reset
    setTranslateY(0);
    setIsDragging(false);
    dragStartRef.current = null;
  }, [translateY, onClose, disableSwipe]);

  // Handle overlay click
  const handleOverlayClick = useCallback(() => {
    if (!disableOverlayClose) {
      onClose();
    }
  }, [onClose, disableOverlayClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset translate when closed
  useEffect(() => {
    if (!isOpen) {
      setTranslateY(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sheetContent = (
    <div className="fixed inset-0 z-sheet">
      {/* Overlay with blur */}
      <div
        className={`
          absolute inset-0 bg-black/30 backdrop-blur-sm
          transition-all duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleOverlayClick}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`
          absolute bottom-0 left-0 right-0
          bg-white/95 dark:bg-slate-900/95
          backdrop-blur-glass-xl
          rounded-t-3xl
          border-t border-white/30 dark:border-slate-700/50
          shadow-glass-xl
          ${heightClasses[height]}
          ${isDragging ? '' : 'transition-transform duration-300 ease-smooth'}
          ${isOpen ? 'slide-in-bottom' : 'translate-y-full'}
        `}
        style={{
          transform: `translateY(${translateY}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className={`overflow-y-auto ${height === 'auto' ? '' : 'flex-1'} safe-area-bottom`}>
          {children}
        </div>
      </div>
    </div>
  );

  // Render do portalu
  return createPortal(sheetContent, document.body);
}

/**
 * BottomSheetHeader - header pro sheet
 */
export interface BottomSheetHeaderProps {
  title: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function BottomSheetHeader({
  title,
  leftAction,
  rightAction,
}: BottomSheetHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-ios-gray-4">
      <div className="w-16">{leftAction}</div>
      <h2 className="text-ios-headline flex-1 text-center">{title}</h2>
      <div className="w-16 flex justify-end">{rightAction}</div>
    </div>
  );
}

/**
 * BottomSheetContent - content wrapper
 */
export interface BottomSheetContentProps {
  children: React.ReactNode;
  className?: string;
}

export function BottomSheetContent({
  children,
  className = '',
}: BottomSheetContentProps) {
  return (
    <div className={`px-4 py-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * BottomSheetFooter - footer s akcemi
 */
export interface BottomSheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function BottomSheetFooter({
  children,
  className = '',
}: BottomSheetFooterProps) {
  return (
    <div className={`px-4 py-4 border-t border-ios-gray-4 safe-area-bottom ${className}`}>
      {children}
    </div>
  );
}
