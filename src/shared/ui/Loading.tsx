/**
 * MST Loading Components
 * 
 * Spinner a loading state komponenty.
 */

import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

/**
 * Spinner - iOS style loading spinner
 */
export function Spinner({
  size = 'md',
  color = 'text-ios-blue',
  className = '',
}: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${sizeMap[size]} ${color} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Načítání"
    >
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
 * LoadingSpinner - alias for Spinner (backward compatibility)
 */
export const LoadingSpinner = Spinner;

/**
 * LoadingScreen - fullscreen loading state with beautiful animation
 */
export interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Načítání...' }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-aurora opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl animate-float-delayed" />
      
      {/* Logo with glow */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center animate-glow">
          <span className="text-2xl font-bold text-white">MST</span>
        </div>
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-brand-500/50 animate-ping" />
      </div>
      
      {/* Loading dots */}
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-brand-500 typing-dot" />
        <div className="w-3 h-3 rounded-full bg-brand-500 typing-dot" />
        <div className="w-3 h-3 rounded-full bg-brand-500 typing-dot" />
      </div>
      
      <p className="text-slate-500 dark:text-slate-400 font-medium relative z-10">{message}</p>
    </div>
  );
}

/**
 * LoadingOverlay - overlay s loading state
 */
export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-overlay flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        {message && (
          <p className="text-ios-footnote text-ios-gray">{message}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Skeleton - loading placeholder
 */
export interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  animate?: boolean;
}

export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  rounded = false,
  className = '',
  animate = true,
}: SkeletonProps) {
  const roundedClass = 
    rounded === true || rounded === 'md' ? 'rounded-xl' :
    rounded === 'sm' ? 'rounded-lg' :
    rounded === 'lg' ? 'rounded-2xl' :
    rounded === 'full' ? 'rounded-full' :
    'rounded-xl';

  return (
    <div
      className={`
        ${animate ? 'animate-pulse' : ''}
        bg-slate-200 dark:bg-slate-800
        ${width} ${height}
        ${roundedClass}
        ${className}
      `}
    />
  );
}

/**
 * SkeletonText - skeleton pro text s náhodnou šířkou
 */
export function SkeletonText({
  lines = 1,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ['w-full', 'w-11/12', 'w-10/12', 'w-9/12', 'w-8/12', 'w-7/12'];
  
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="h-4"
          width={i === lines - 1 && lines > 1 ? widths[Math.floor(Math.random() * 3) + 3] : widths[Math.floor(Math.random() * 2)]}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard - skeleton pro kartu
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 space-y-3 border border-slate-200/50 dark:border-slate-700/50 ${className}`}>
      <Skeleton height="h-5" width="w-3/4" />
      <Skeleton height="h-4" width="w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton height="h-8" width="w-20" rounded="lg" />
        <Skeleton height="h-8" width="w-20" rounded="lg" />
      </div>
    </div>
  );
}

/**
 * SkeletonList - skeleton pro seznam
 */
export function SkeletonList({ 
  count = 3,
  showAvatar = true,
  className = '',
}: { 
  count?: number;
  showAvatar?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 border border-slate-200/50 dark:border-slate-700/50"
        >
          {showAvatar && <Skeleton width="w-12" height="h-12" rounded="full" />}
          <div className="flex-1 space-y-2">
            <Skeleton height="h-4" width="w-3/4" />
            <Skeleton height="h-3" width="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonProject - skeleton pro projekt card
 */
export function SkeletonProject({ featured = false }: { featured?: boolean }) {
  if (featured) {
    return (
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 rounded-2xl animate-pulse" />
        <div className="relative m-[1px] bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton height="h-6" width="w-2/3" />
              <div className="flex items-center gap-2">
                <Skeleton height="h-4" width="w-4" rounded="full" />
                <Skeleton height="h-4" width="w-1/3" />
              </div>
            </div>
            <Skeleton height="h-6" width="w-16" rounded="full" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton height="h-4" width="w-20" />
              <Skeleton height="h-4" width="w-12" />
            </div>
            <Skeleton height="h-2" width="w-full" rounded="full" />
          </div>
          <div className="flex justify-between">
            <Skeleton height="h-4" width="w-24" />
            <Skeleton height="h-4" width="w-16" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 space-y-3 border border-slate-200/50 dark:border-slate-700/50">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton height="h-5" width="w-2/3" />
          <Skeleton height="h-4" width="w-1/3" />
        </div>
        <Skeleton height="h-5" width="w-14" rounded="full" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton height="h-1.5" width="w-full" rounded="full" className="flex-1" />
        <Skeleton height="h-4" width="w-10" />
      </div>
    </div>
  );
}

/**
 * SkeletonChat - skeleton pro chat konverzaci
 */
export function SkeletonChat({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Received message */}
      <div className="flex items-end gap-2">
        <Skeleton width="w-8" height="h-8" rounded="full" />
        <div className="space-y-1">
          <Skeleton width="w-48" height="h-10" rounded="lg" />
          <Skeleton width="w-32" height="h-10" rounded="lg" />
        </div>
      </div>
      
      {/* Sent message */}
      <div className="flex items-end gap-2 justify-end">
        <div className="space-y-1 items-end flex flex-col">
          <Skeleton width="w-40" height="h-10" rounded="lg" className="bg-brand-200 dark:bg-brand-900" />
        </div>
      </div>

      {/* Another received */}
      <div className="flex items-end gap-2">
        <Skeleton width="w-8" height="h-8" rounded="full" />
        <Skeleton width="w-56" height="h-10" rounded="lg" />
      </div>
    </div>
  );
}

/**
 * SkeletonStats - skeleton pro statistiky
 */
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 space-y-2 border border-slate-200/50 dark:border-slate-700/50"
        >
          <Skeleton height="h-3" width="w-16" />
          <Skeleton height="h-8" width="w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonDetail - skeleton pro detail screen
 */
export function SkeletonDetail({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-3xl p-6 space-y-4 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton height="h-8" width="w-48" animate={false} />
            <Skeleton height="h-5" width="w-32" animate={false} />
          </div>
          <Skeleton height="h-6" width="w-16" rounded="full" animate={false} />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton height="h-16" width="w-16" rounded="full" animate={false} />
          <div className="flex-1">
            <Skeleton height="h-3" width="w-full" rounded="full" animate={false} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <SkeletonStats />

      {/* Content sections */}
      <div className="space-y-4">
        <Skeleton height="h-5" width="w-32" />
        <SkeletonList count={2} showAvatar={false} />
      </div>
    </div>
  );
}
