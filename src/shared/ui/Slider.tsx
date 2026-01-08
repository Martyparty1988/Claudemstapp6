/**
 * MST Slider Component - 2026 Edition
 * 
 * Moderní slider s iOS stylem a gradienty.
 */

import React, { useCallback, useRef, useState } from 'react';

export interface SliderProps {
  /** Aktuální hodnota */
  value: number;
  /** Callback při změně */
  onChange: (value: number) => void;
  /** Minimální hodnota */
  min?: number;
  /** Maximální hodnota */
  max?: number;
  /** Krok */
  step?: number;
  /** Barva */
  color?: 'brand' | 'success' | 'warning' | 'error' | 'accent';
  /** Zobrazit hodnotu */
  showValue?: boolean;
  /** Formát hodnoty */
  formatValue?: (value: number) => string;
  /** Disabled */
  disabled?: boolean;
  /** Label */
  label?: string;
  /** Marks/značky */
  marks?: { value: number; label?: string }[];
}

const colorStyles: Record<string, { track: string; thumb: string; glow: string }> = {
  brand: {
    track: 'bg-gradient-to-r from-brand-500 to-brand-600',
    thumb: 'bg-white shadow-lg shadow-brand-500/30',
    glow: 'shadow-brand-500/40',
  },
  success: {
    track: 'bg-gradient-to-r from-success-500 to-success-600',
    thumb: 'bg-white shadow-lg shadow-success-500/30',
    glow: 'shadow-success-500/40',
  },
  warning: {
    track: 'bg-gradient-to-r from-warning-500 to-warning-600',
    thumb: 'bg-white shadow-lg shadow-warning-500/30',
    glow: 'shadow-warning-500/40',
  },
  error: {
    track: 'bg-gradient-to-r from-error-500 to-error-600',
    thumb: 'bg-white shadow-lg shadow-error-500/30',
    glow: 'shadow-error-500/40',
  },
  accent: {
    track: 'bg-gradient-to-r from-accent-500 to-accent-600',
    thumb: 'bg-white shadow-lg shadow-accent-500/30',
    glow: 'shadow-accent-500/40',
  },
};

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  color = 'brand',
  showValue = false,
  formatValue,
  disabled = false,
  label,
  marks,
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const colors = colorStyles[color];
  
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback((clientX: number) => {
    if (!trackRef.current || disabled) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newValue = min + (max - min) * percent;
    const steppedValue = Math.round(newValue / step) * step;
    
    onChange(Math.max(min, Math.min(max, steppedValue)));
  }, [min, max, step, onChange, disabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleChange(e.clientX);

    const handleMouseMove = (e: MouseEvent) => {
      handleChange(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleChange(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleChange(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const displayValue = formatValue ? formatValue(value) : value;

  return (
    <div className={`${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Label and value */}
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {displayValue}
            </span>
          )}
        </div>
      )}

      {/* Slider track */}
      <div
        ref={trackRef}
        className="relative h-6 flex items-center cursor-pointer touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background track */}
        <div className="absolute inset-x-0 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
        
        {/* Filled track */}
        <div
          className={`absolute left-0 h-2 rounded-full ${colors.track} transition-all duration-75`}
          style={{ width: `${percentage}%` }}
        />

        {/* Marks */}
        {marks?.map((mark) => {
          const markPercent = ((mark.value - min) / (max - min)) * 100;
          const isActive = mark.value <= value;
          return (
            <div
              key={mark.value}
              className="absolute flex flex-col items-center"
              style={{ left: `${markPercent}%`, transform: 'translateX(-50%)' }}
            >
              <div
                className={`
                  w-2 h-2 rounded-full mt-4
                  ${isActive ? colors.track : 'bg-slate-300 dark:bg-slate-600'}
                `}
              />
              {mark.label && (
                <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {mark.label}
                </span>
              )}
            </div>
          );
        })}

        {/* Thumb */}
        <div
          className={`
            absolute w-6 h-6 rounded-full
            ${colors.thumb}
            ${isDragging ? 'scale-110 ' + colors.glow : ''}
            transition-transform duration-150
            -translate-x-1/2
          `}
          style={{ left: `${percentage}%` }}
        >
          {/* Inner circle */}
          <div 
            className={`
              absolute inset-1.5 rounded-full
              ${colors.track}
            `}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Range Slider s dvěma thumby
 */
export interface RangeSliderProps {
  /** Rozsah hodnot [min, max] */
  value: [number, number];
  /** Callback při změně */
  onChange: (value: [number, number]) => void;
  /** Minimální hodnota */
  min?: number;
  /** Maximální hodnota */
  max?: number;
  /** Krok */
  step?: number;
  /** Barva */
  color?: 'brand' | 'success' | 'warning' | 'error' | 'accent';
  /** Label */
  label?: string;
}

export function RangeSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  color = 'brand',
  label,
}: RangeSliderProps) {
  const colors = colorStyles[color];
  const [minVal, maxVal] = value;
  
  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), maxVal - step);
    onChange([newMin, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), minVal + step);
    onChange([minVal, newMax]);
  };

  return (
    <div>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {minVal} - {maxVal}
          </span>
        </div>
      )}

      <div className="relative h-6">
        {/* Background track */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
        
        {/* Filled track */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-2 rounded-full ${colors.track}`}
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Inputs */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          className="absolute w-full h-full opacity-0 cursor-pointer pointer-events-auto"
          style={{ zIndex: minVal > max - 10 ? 5 : 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          className="absolute w-full h-full opacity-0 cursor-pointer pointer-events-auto"
          style={{ zIndex: 4 }}
        />

        {/* Thumbs */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${colors.thumb} pointer-events-none`}
          style={{ left: `calc(${minPercent}% - 12px)` }}
        >
          <div className={`absolute inset-1.5 rounded-full ${colors.track}`} />
        </div>
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${colors.thumb} pointer-events-none`}
          style={{ left: `calc(${maxPercent}% - 12px)` }}
        >
          <div className={`absolute inset-1.5 rounded-full ${colors.track}`} />
        </div>
      </div>
    </div>
  );
}

export default Slider;
