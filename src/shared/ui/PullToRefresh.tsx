/**
 * MST Pull to Refresh Component
 * 
 * iOS-style pull-to-refresh s animací.
 */

import React, { useState, useRef, useCallback } from 'react';

/**
 * Props
 */
export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  pullThreshold?: number;
  maxPull?: number;
  className?: string;
}

/**
 * Refresh state
 */
type RefreshState = 'idle' | 'pulling' | 'ready' | 'refreshing';

/**
 * PullToRefresh Component
 */
export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  pullThreshold = 80,
  maxPull = 120,
  className = '',
}: PullToRefreshProps) {
  const [state, setState] = useState<RefreshState>('idle');
  const [pullDistance, setPullDistance] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  // Check if at top of scroll
  const isAtTop = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;
    return container.scrollTop <= 0;
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || state === 'refreshing') return;
    if (!isAtTop()) return;

    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
  }, [disabled, state, isAtTop]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || state === 'refreshing') return;
    if (startY.current === 0) return;
    if (!isAtTop()) {
      setPullDistance(0);
      setState('idle');
      return;
    }

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      // Apply resistance
      const resistance = 0.5;
      const pull = Math.min(diff * resistance, maxPull);
      setPullDistance(pull);

      if (pull >= pullThreshold) {
        setState('ready');
      } else {
        setState('pulling');
      }

      // Prevent default scroll when pulling
      e.preventDefault();
    }
  }, [disabled, state, isAtTop, maxPull, pullThreshold]);

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (disabled || state === 'refreshing') return;

    if (state === 'ready') {
      setState('refreshing');
      setPullDistance(60); // Keep spinner visible

      try {
        await onRefresh();
      } finally {
        setState('idle');
        setPullDistance(0);
      }
    } else {
      setState('idle');
      setPullDistance(0);
    }

    startY.current = 0;
    currentY.current = 0;
  }, [disabled, state, onRefresh]);

  // Calculate spinner opacity and rotation
  const spinnerOpacity = Math.min(pullDistance / pullThreshold, 1);
  const spinnerRotation = (pullDistance / pullThreshold) * 180;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center pointer-events-none z-10 transition-transform"
        style={{
          top: -60,
          height: 60,
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        <div
          className={`
            w-8 h-8 rounded-full
            flex items-center justify-center
            transition-all duration-200
            ${state === 'refreshing' 
              ? 'bg-brand-500' 
              : 'bg-white dark:bg-slate-800 shadow-lg'
            }
          `}
          style={{
            opacity: spinnerOpacity,
          }}
        >
          {state === 'refreshing' ? (
            <LoadingSpinner className="w-5 h-5 text-white" />
          ) : (
            <ArrowIcon
              className={`w-5 h-5 transition-transform duration-200 ${
                state === 'ready' 
                  ? 'text-brand-500 rotate-180' 
                  : 'text-slate-400'
              }`}
              style={{
                transform: `rotate(${state === 'ready' ? 180 : spinnerRotation}deg)`,
              }}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: state === 'refreshing' 
            ? 'translateY(60px)' 
            : `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Loading Spinner
 */
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/**
 * Arrow Icon
 */
function ArrowIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      className={className} 
      style={style}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}

/**
 * Hook pro jednodušší použití
 */
export function usePullToRefresh(refreshFn: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshFn();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFn]);

  return {
    isRefreshing,
    handleRefresh,
  };
}

export default PullToRefresh;
