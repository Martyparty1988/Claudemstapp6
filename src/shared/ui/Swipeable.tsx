/**
 * MST Gesture Handler - 2026 Edition
 * 
 * Podpora pro swipe gesta na mobile.
 * Swipe left/right pro rychlé akce na položkách.
 */

import React, { useRef, useState, useCallback } from 'react';

export interface SwipeAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color: 'brand' | 'success' | 'warning' | 'error' | 'accent' | 'slate';
  onClick: () => void;
}

export interface SwipeableProps {
  children: React.ReactNode;
  /** Akce při swipe doleva */
  leftActions?: SwipeAction[];
  /** Akce při swipe doprava */
  rightActions?: SwipeAction[];
  /** Práh pro aktivaci (v px) */
  threshold?: number;
  /** Disabled */
  disabled?: boolean;
  /** Callback při swipe */
  onSwipe?: (direction: 'left' | 'right') => void;
}

const colorStyles: Record<SwipeAction['color'], string> = {
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  accent: 'bg-accent-500',
  slate: 'bg-slate-500',
};

export function Swipeable({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  disabled = false,
  onSwipe,
}: SwipeableProps) {
  const [offset, setOffset] = useState(0);
  const [isOpen, setIsOpen] = useState<'left' | 'right' | null>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxLeftOffset = leftActions.length * 80;
  const maxRightOffset = rightActions.length * 80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    currentX.current = offset;
    isDragging.current = true;
  }, [disabled, offset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || disabled) return;
    
    const diff = e.touches[0].clientX - startX.current;
    let newOffset = currentX.current + diff;
    
    // Limity
    if (leftActions.length === 0) {
      newOffset = Math.min(0, newOffset);
    }
    if (rightActions.length === 0) {
      newOffset = Math.max(0, newOffset);
    }
    
    // Resistance na krajích
    if (newOffset > maxRightOffset) {
      newOffset = maxRightOffset + (newOffset - maxRightOffset) * 0.3;
    }
    if (newOffset < -maxLeftOffset) {
      newOffset = -maxLeftOffset + (newOffset + maxLeftOffset) * 0.3;
    }
    
    setOffset(newOffset);
  }, [disabled, leftActions.length, rightActions.length, maxLeftOffset, maxRightOffset]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    // Snap to positions
    if (offset > threshold && rightActions.length > 0) {
      setOffset(maxRightOffset);
      setIsOpen('right');
      onSwipe?.('right');
    } else if (offset < -threshold && leftActions.length > 0) {
      setOffset(-maxLeftOffset);
      setIsOpen('left');
      onSwipe?.('left');
    } else {
      setOffset(0);
      setIsOpen(null);
    }
  }, [offset, threshold, leftActions.length, rightActions.length, maxLeftOffset, maxRightOffset, onSwipe]);

  const close = useCallback(() => {
    setOffset(0);
    setIsOpen(null);
  }, []);

  const handleActionClick = useCallback((action: SwipeAction) => {
    action.onClick();
    close();
  }, [close]);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden"
    >
      {/* Left actions (shown when swiping right) */}
      {rightActions.length > 0 && (
        <div 
          className="absolute left-0 top-0 bottom-0 flex"
          style={{ width: maxRightOffset }}
        >
          {rightActions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={`
                flex-1 flex flex-col items-center justify-center
                ${colorStyles[action.color]}
                text-white
                transition-transform
              `}
              style={{
                transform: `translateX(${Math.min(0, offset - maxRightOffset)}px)`,
              }}
            >
              {action.icon && (
                <span className="w-6 h-6 mb-1">{action.icon}</span>
              )}
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right actions (shown when swiping left) */}
      {leftActions.length > 0 && (
        <div 
          className="absolute right-0 top-0 bottom-0 flex"
          style={{ width: maxLeftOffset }}
        >
          {leftActions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={`
                flex-1 flex flex-col items-center justify-center
                ${colorStyles[action.color]}
                text-white
                transition-transform
              `}
              style={{
                transform: `translateX(${Math.max(0, offset + maxLeftOffset)}px)`,
              }}
            >
              {action.icon && (
                <span className="w-6 h-6 mb-1">{action.icon}</span>
              )}
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div
        className="relative bg-white dark:bg-slate-800 transition-transform duration-200"
        style={{
          transform: `translateX(${offset}px)`,
          transitionDuration: isDragging.current ? '0ms' : '200ms',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Overlay to close when open */}
      {isOpen && (
        <div 
          className="absolute inset-0 z-10"
          onClick={close}
        />
      )}
    </div>
  );
}

/**
 * Swipeable List Item - předpřipravený item s akcemi
 */
export interface SwipeableListItemProps {
  children: React.ReactNode;
  /** Smazat */
  onDelete?: () => void;
  /** Archivovat */
  onArchive?: () => void;
  /** Označit jako dokončené */
  onComplete?: () => void;
  /** Editovat */
  onEdit?: () => void;
  /** Sdílet */
  onShare?: () => void;
}

export function SwipeableListItem({
  children,
  onDelete,
  onArchive,
  onComplete,
  onEdit,
  onShare,
}: SwipeableListItemProps) {
  const leftActions: SwipeAction[] = [];
  const rightActions: SwipeAction[] = [];

  // Right side (swipe left to reveal)
  if (onDelete) {
    leftActions.push({
      id: 'delete',
      label: 'Smazat',
      icon: <TrashIcon />,
      color: 'error',
      onClick: onDelete,
    });
  }
  if (onArchive) {
    leftActions.push({
      id: 'archive',
      label: 'Archiv',
      icon: <ArchiveIcon />,
      color: 'slate',
      onClick: onArchive,
    });
  }

  // Left side (swipe right to reveal)
  if (onComplete) {
    rightActions.push({
      id: 'complete',
      label: 'Hotovo',
      icon: <CheckIcon />,
      color: 'success',
      onClick: onComplete,
    });
  }
  if (onEdit) {
    rightActions.push({
      id: 'edit',
      label: 'Upravit',
      icon: <EditIcon />,
      color: 'brand',
      onClick: onEdit,
    });
  }
  if (onShare) {
    rightActions.push({
      id: 'share',
      label: 'Sdílet',
      icon: <ShareIcon />,
      color: 'accent',
      onClick: onShare,
    });
  }

  return (
    <Swipeable leftActions={leftActions} rightActions={rightActions}>
      {children}
    </Swipeable>
  );
}

/**
 * Hook pro detekci swipe gest
 */
export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 50
) {
  const startPos = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const diffX = endX - startPos.current.x;
    const diffY = endY - startPos.current.y;
    
    // Horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
    // Vertical swipe
    else if (Math.abs(diffY) > threshold) {
      if (diffY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}

// Icons
function TrashIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

export default Swipeable;
