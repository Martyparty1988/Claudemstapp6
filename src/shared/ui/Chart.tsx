/**
 * MST Chart Components - 2026 Edition
 * 
 * Jednoduché chart komponenty pro dashboard.
 * Bez závislostí - pure SVG/CSS.
 */

import React from 'react';

// ============ PROGRESS BAR ============

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'brand' | 'success' | 'warning' | 'error' | 'accent';
  showValue?: boolean;
  label?: string;
  animated?: boolean;
  gradient?: boolean;
}

const progressColors: Record<string, { bar: string; gradient: string }> = {
  brand: {
    bar: 'bg-brand-500',
    gradient: 'from-brand-500 to-brand-600',
  },
  success: {
    bar: 'bg-success-500',
    gradient: 'from-success-500 to-emerald-400',
  },
  warning: {
    bar: 'bg-warning-500',
    gradient: 'from-warning-500 to-orange-400',
  },
  error: {
    bar: 'bg-error-500',
    gradient: 'from-error-500 to-rose-400',
  },
  accent: {
    bar: 'bg-accent-500',
    gradient: 'from-accent-500 to-pink-400',
  },
};

const progressSizes = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'brand',
  showValue = false,
  label,
  animated = true,
  gradient = false,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = progressColors[color];

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${progressSizes[size]} bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden`}>
        <div
          className={`
            h-full rounded-full
            ${gradient ? `bg-gradient-to-r ${colors.gradient}` : colors.bar}
            ${animated ? 'transition-all duration-500 ease-out' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============ BAR CHART ============

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarChartData[];
  height?: number;
  showValues?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  horizontal?: boolean;
  gradient?: boolean;
}

export function BarChart({
  data,
  height = 200,
  showValues = true,
  showLabels = true,
  animated = true,
  horizontal = false,
  gradient = true,
}: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  const defaultColors = [
    'from-brand-500 to-brand-400',
    'from-accent-500 to-accent-400',
    'from-success-500 to-success-400',
    'from-warning-500 to-warning-400',
    'from-error-500 to-error-400',
  ];

  if (horizontal) {
    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const colorClass = item.color || defaultColors[index % defaultColors.length];
          
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
                {showValues && (
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.value.toLocaleString('cs-CZ')}
                  </span>
                )}
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`
                    h-full rounded-full
                    ${gradient ? `bg-gradient-to-r ${colorClass}` : 'bg-brand-500'}
                    ${animated ? 'transition-all duration-700 ease-out' : ''}
                  `}
                  style={{ 
                    width: `${percentage}%`,
                    animationDelay: animated ? `${index * 100}ms` : undefined,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ height }} className="flex items-end gap-2">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        const colorClass = item.color || defaultColors[index % defaultColors.length];
        
        return (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
            {/* Value */}
            {showValues && (
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {item.value}
              </span>
            )}
            
            {/* Bar */}
            <div 
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden"
              style={{ height: `calc(${height}px - 40px)` }}
            >
              <div
                className={`
                  w-full rounded-t-lg
                  ${gradient ? `bg-gradient-to-t ${colorClass}` : 'bg-brand-500'}
                  ${animated ? 'transition-all duration-700 ease-out' : ''}
                `}
                style={{ 
                  height: `${percentage}%`,
                  marginTop: 'auto',
                }}
              />
            </div>
            
            {/* Label */}
            {showLabels && (
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate w-full text-center">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============ DONUT CHART ============

export interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutChartData[];
  size?: number;
  thickness?: number;
  showTotal?: boolean;
  totalLabel?: string;
  animated?: boolean;
  children?: React.ReactNode;
}

export function DonutChart({
  data,
  size = 160,
  thickness = 20,
  showTotal = true,
  totalLabel = 'Celkem',
  animated = true,
  children,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;

  let currentOffset = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          className="text-slate-100 dark:text-slate-800"
        />
        
        {/* Data segments */}
        {data.map((item, index) => {
          const percentage = item.value / total;
          const segmentLength = circumference * percentage;
          const offset = currentOffset;
          currentOffset += segmentLength;

          return (
            <circle
              key={item.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={thickness}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className={animated ? 'transition-all duration-700 ease-out' : ''}
              style={{ animationDelay: animated ? `${index * 100}ms` : undefined }}
            />
          );
        })}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (showTotal && (
          <>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {total.toLocaleString('cs-CZ')}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {totalLabel}
            </span>
          </>
        ))}
      </div>
    </div>
  );
}

// ============ MINI SPARKLINE ============

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: 'brand' | 'success' | 'warning' | 'error' | 'accent';
  fill?: boolean;
  animated?: boolean;
}

const sparklineColors: Record<string, { stroke: string; fill: string }> = {
  brand: { stroke: '#0ba5ec', fill: 'rgba(11, 165, 236, 0.1)' },
  success: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.1)' },
  warning: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.1)' },
  error: { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.1)' },
  accent: { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.1)' },
};

export function Sparkline({
  data,
  width = 100,
  height = 32,
  color = 'brand',
  fill = true,
  animated = true,
}: SparklineProps) {
  if (data.length < 2) return null;

  const colors = sparklineColors[color];
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(' L')}`;
  const fillPath = `${linePath} L${width - padding},${height - padding} L${padding},${height - padding} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {fill && (
        <path
          d={fillPath}
          fill={colors.fill}
          className={animated ? 'animate-fade-in' : ''}
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'animate-fade-in' : ''}
      />
      {/* End dot */}
      <circle
        cx={width - padding}
        cy={padding + chartHeight - ((data[data.length - 1] - min) / range) * chartHeight}
        r={3}
        fill={colors.stroke}
      />
    </svg>
  );
}

// ============ LEGEND ============

export interface LegendItem {
  label: string;
  color: string;
  value?: number | string;
}

export interface LegendProps {
  items: LegendItem[];
  direction?: 'horizontal' | 'vertical';
}

export function Legend({ items, direction = 'horizontal' }: LegendProps) {
  return (
    <div className={`
      flex gap-4
      ${direction === 'vertical' ? 'flex-col' : 'flex-wrap'}
    `}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {item.label}
          </span>
          {item.value !== undefined && (
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProgressBar;
