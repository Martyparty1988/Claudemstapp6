/**
 * MST ProgressRing Component - 2026 Edition
 * 
 * Kruhový progress indikátor s animacemi.
 */

import React from 'react';

export interface ProgressRingProps {
  /** Procento dokončení (0-100) */
  value: number;
  /** Velikost kruhu v px */
  size?: number;
  /** Tloušťka čáry */
  strokeWidth?: number;
  /** Barva progress */
  color?: 'brand' | 'success' | 'warning' | 'error' | 'accent';
  /** Zobrazit procenta uprostřed */
  showValue?: boolean;
  /** Vlastní obsah uprostřed */
  children?: React.ReactNode;
  /** Animovat při mountu */
  animated?: boolean;
  /** Gradient efekt */
  gradient?: boolean;
  /** Glow efekt */
  glow?: boolean;
}

const colorMap: Record<string, { stroke: string; glow: string; gradient: [string, string] }> = {
  brand: {
    stroke: '#0ba5ec',
    glow: 'rgba(11, 165, 236, 0.4)',
    gradient: ['#0ba5ec', '#a855f7'],
  },
  success: {
    stroke: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    gradient: ['#10b981', '#06b6d4'],
  },
  warning: {
    stroke: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    gradient: ['#f59e0b', '#ef4444'],
  },
  error: {
    stroke: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.4)',
    gradient: ['#f43f5e', '#ec4899'],
  },
  accent: {
    stroke: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
    gradient: ['#a855f7', '#ec4899'],
  },
};

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  color = 'brand',
  showValue = true,
  children,
  animated = true,
  gradient = false,
  glow = false,
}: ProgressRingProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedValue / 100) * circumference;
  
  const colors = colorMap[color];
  const gradientId = `progress-gradient-${color}`;

  return (
    <div 
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Glow effect */}
      {glow && normalizedValue > 0 && (
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30 transition-opacity duration-500"
          style={{ backgroundColor: colors.glow }}
        />
      )}
      
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Gradient definition */}
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.gradient[0]} />
              <stop offset="100%" stopColor={colors.gradient[1]} />
            </linearGradient>
          </defs>
        )}
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gradient ? `url(#${gradientId})` : colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={animated ? 'transition-all duration-700 ease-out' : ''}
          style={{
            filter: glow ? `drop-shadow(0 0 6px ${colors.glow})` : undefined,
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showValue && (
          <span className="text-2xl font-bold text-slate-800 dark:text-white">
            {Math.round(normalizedValue)}%
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Mini verze pro inline použití
 */
export function ProgressRingMini({
  value,
  size = 32,
  color = 'brand',
}: Pick<ProgressRingProps, 'value' | 'size' | 'color'>) {
  return (
    <ProgressRing
      value={value}
      size={size}
      strokeWidth={3}
      color={color}
      showValue={false}
      animated
    />
  );
}

export default ProgressRing;
