/**
 * MST Tabs Component - 2026 Edition
 * 
 * Moderní taby s animovaným indikátorem.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

export interface TabsProps {
  /** Seznam tabů */
  tabs: Tab[];
  /** Aktivní tab ID */
  activeTab: string;
  /** Callback při změně */
  onChange: (tabId: string) => void;
  /** Varianta */
  variant?: 'default' | 'pills' | 'underline' | 'glass';
  /** Velikost */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Barva aktivního tabu */
  color?: 'brand' | 'accent' | 'slate';
}

const sizeStyles = {
  sm: {
    tab: 'px-3 py-1.5 text-sm',
    icon: 'w-4 h-4',
    badge: 'text-xs px-1.5 min-w-[18px] h-[18px]',
  },
  md: {
    tab: 'px-4 py-2 text-base',
    icon: 'w-5 h-5',
    badge: 'text-xs px-2 min-w-[20px] h-[20px]',
  },
  lg: {
    tab: 'px-5 py-2.5 text-lg',
    icon: 'w-6 h-6',
    badge: 'text-sm px-2 min-w-[22px] h-[22px]',
  },
};

const colorStyles = {
  brand: {
    active: 'text-brand-600 dark:text-brand-400',
    indicator: 'bg-brand-500',
    pill: 'bg-brand-500 text-white',
    badge: 'bg-brand-500 text-white',
  },
  accent: {
    active: 'text-accent-600 dark:text-accent-400',
    indicator: 'bg-accent-500',
    pill: 'bg-accent-500 text-white',
    badge: 'bg-accent-500 text-white',
  },
  slate: {
    active: 'text-slate-900 dark:text-white',
    indicator: 'bg-slate-900 dark:bg-white',
    pill: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
    badge: 'bg-slate-700 text-white',
  },
};

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  color = 'brand',
}: TabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sizes = sizeStyles[size];
  const colors = colorStyles[color];

  // Aktualizovat pozici indikátoru
  const updateIndicator = useCallback(() => {
    const activeElement = tabRefs.current.get(activeTab);
    const container = containerRef.current;
    
    if (activeElement && container) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();
      
      setIndicatorStyle({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const baseTabStyles = `
    relative flex items-center justify-center gap-2
    font-medium
    transition-all duration-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
  `;

  const variantStyles = {
    default: {
      container: 'border-b border-slate-200 dark:border-slate-700',
      tab: `${baseTabStyles} ${sizes.tab} text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200`,
      activeTab: colors.active,
      indicator: true,
    },
    underline: {
      container: '',
      tab: `${baseTabStyles} ${sizes.tab} text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200`,
      activeTab: colors.active,
      indicator: true,
    },
    pills: {
      container: 'bg-slate-100 dark:bg-slate-800 rounded-xl p-1',
      tab: `${baseTabStyles} ${sizes.tab} rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white`,
      activeTab: `${colors.pill} shadow-md`,
      indicator: false,
    },
    glass: {
      container: 'bg-white/40 dark:bg-slate-800/40 backdrop-blur-glass rounded-2xl p-1.5 border border-white/30 dark:border-slate-700/30',
      tab: `${baseTabStyles} ${sizes.tab} rounded-xl text-slate-600 dark:text-slate-400`,
      activeTab: 'bg-white dark:bg-slate-700 shadow-card text-slate-900 dark:text-white',
      indicator: false,
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      ref={containerRef}
      className={`
        relative flex
        ${styles.container}
        ${fullWidth ? 'w-full' : 'w-fit'}
      `}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        
        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
            }}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={`
              ${styles.tab}
              ${isActive ? styles.activeTab : ''}
              ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              ${fullWidth ? 'flex-1' : ''}
            `}
          >
            {/* Icon */}
            {tab.icon && (
              <span className={sizes.icon}>
                {tab.icon}
              </span>
            )}
            
            {/* Label */}
            <span>{tab.label}</span>
            
            {/* Badge */}
            {tab.badge !== undefined && (
              <span 
                className={`
                  ${sizes.badge} 
                  rounded-full 
                  flex items-center justify-center 
                  font-semibold
                  ${isActive && variant === 'pills' ? 'bg-white/30' : colors.badge}
                `}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}

      {/* Animated indicator for default/underline variants */}
      {styles.indicator && (
        <div
          className={`
            absolute bottom-0 h-0.5 rounded-full
            ${colors.indicator}
            transition-all duration-300 ease-out
          `}
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
      )}
    </div>
  );
}

/**
 * Tab Panel - content container
 */
export interface TabPanelProps {
  children: React.ReactNode;
  tabId: string;
  activeTab: string;
  /** Animace při změně */
  animated?: boolean;
}

export function TabPanel({ children, tabId, activeTab, animated = true }: TabPanelProps) {
  const isActive = tabId === activeTab;
  
  if (!isActive) return null;

  return (
    <div
      className={animated ? 'animate-fade-in' : ''}
      role="tabpanel"
    >
      {children}
    </div>
  );
}

/**
 * Segmented Control - iOS style
 */
export interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
}: SegmentedControlProps) {
  const sizes = sizeStyles[size];
  const activeIndex = options.findIndex(opt => opt.value === value);

  return (
    <div 
      className={`
        relative flex
        bg-slate-100 dark:bg-slate-800
        rounded-xl p-1
        ${fullWidth ? 'w-full' : 'w-fit'}
      `}
    >
      {/* Sliding background */}
      <div
        className="absolute top-1 bottom-1 bg-white dark:bg-slate-700 rounded-lg shadow-sm transition-all duration-200"
        style={{
          width: `calc(${100 / options.length}% - 4px)`,
          left: `calc(${(100 / options.length) * activeIndex}% + 2px)`,
        }}
      />

      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            relative z-10 flex-1
            ${sizes.tab}
            font-medium
            transition-colors duration-200
            ${value === option.value 
              ? 'text-slate-900 dark:text-white' 
              : 'text-slate-500 dark:text-slate-400'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
