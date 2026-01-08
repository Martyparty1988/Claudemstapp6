/**
 * MST Timeline Component - 2026 Edition
 * 
 * Timeline pro zobrazení historických událostí a aktivit.
 */

import React from 'react';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  icon?: React.ReactNode;
  color?: 'brand' | 'success' | 'warning' | 'error' | 'accent' | 'slate';
  status?: 'completed' | 'current' | 'pending';
  meta?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  /** Varianta zobrazení */
  variant?: 'default' | 'compact' | 'card';
  /** Animace při zobrazení */
  animated?: boolean;
}

const colorStyles: Record<string, { dot: string; line: string; icon: string }> = {
  brand: {
    dot: 'bg-brand-500',
    line: 'bg-brand-200 dark:bg-brand-800',
    icon: 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
  },
  success: {
    dot: 'bg-success-500',
    line: 'bg-success-200 dark:bg-success-800',
    icon: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
  },
  warning: {
    dot: 'bg-warning-500',
    line: 'bg-warning-200 dark:bg-warning-800',
    icon: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
  },
  error: {
    dot: 'bg-error-500',
    line: 'bg-error-200 dark:bg-error-800',
    icon: 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400',
  },
  accent: {
    dot: 'bg-accent-500',
    line: 'bg-accent-200 dark:bg-accent-800',
    icon: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400',
  },
  slate: {
    dot: 'bg-slate-400',
    line: 'bg-slate-200 dark:bg-slate-700',
    icon: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
};

function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Méně než hodina
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return minutes <= 1 ? 'Právě teď' : `Před ${minutes} min`;
  }
  
  // Méně než den
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `Před ${hours} h`;
  }
  
  // Méně než týden
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return days === 1 ? 'Včera' : `Před ${days} dny`;
  }
  
  return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
}

export function Timeline({ items, variant = 'default', animated = true }: TimelineProps) {
  return (
    <div className="relative">
      {items.map((item, index) => {
        const colors = colorStyles[item.color || 'brand'];
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <div
            key={item.id}
            className={`
              relative flex gap-4
              ${animated ? 'animate-fade-in' : ''}
            `}
            style={animated ? { animationDelay: `${index * 100}ms` } : undefined}
          >
            {/* Line & Dot */}
            <div className="flex flex-col items-center">
              {/* Dot / Icon */}
              {item.icon ? (
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${colors.icon}
                  ${item.status === 'current' ? 'ring-4 ring-brand-100 dark:ring-brand-900/50' : ''}
                `}>
                  <div className="w-5 h-5">{item.icon}</div>
                </div>
              ) : (
                <div className={`
                  w-3 h-3 rounded-full mt-1.5
                  ${colors.dot}
                  ${item.status === 'current' ? 'ring-4 ring-brand-100 dark:ring-brand-900/50 animate-pulse' : ''}
                  ${item.status === 'pending' ? 'opacity-40' : ''}
                `} />
              )}
              
              {/* Connecting line */}
              {!isLast && (
                <div className={`
                  flex-1 w-0.5 my-2
                  ${item.status === 'pending' ? 'bg-slate-200 dark:bg-slate-700' : colors.line}
                `} />
              )}
            </div>

            {/* Content */}
            <div className={`
              flex-1 pb-6
              ${item.status === 'pending' ? 'opacity-50' : ''}
            `}>
              {variant === 'card' ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-card border border-slate-100 dark:border-slate-700">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  )}
                  {item.meta && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      {item.meta}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className={`
                      font-medium text-slate-900 dark:text-white
                      ${variant === 'compact' ? 'text-sm' : ''}
                    `}>
                      {item.title}
                    </h4>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                  {item.description && (
                    <p className={`
                      text-slate-600 dark:text-slate-400
                      ${variant === 'compact' ? 'text-xs' : 'text-sm'}
                    `}>
                      {item.description}
                    </p>
                  )}
                  {item.meta && (
                    <div className="mt-2">{item.meta}</div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Activity Feed - varianta pro aktivitu
 */
export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: Date | string;
  icon?: React.ReactNode;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
  onViewAll?: () => void;
}

export function ActivityFeed({ items, maxItems = 5, onViewAll }: ActivityFeedProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <div className="space-y-4">
      {displayItems.map((item, index) => (
        <div
          key={item.id}
          className="flex items-start gap-3 animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Avatar */}
          <div className="relative">
            {item.user.avatar ? (
              <img
                src={item.user.avatar}
                alt={item.user.name}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white text-sm font-semibold">
                {item.user.name.charAt(0)}
              </div>
            )}
            {item.icon && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                <div className="w-3 h-3 text-slate-500">{item.icon}</div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-medium text-slate-900 dark:text-white">
                {item.user.name}
              </span>
              {' '}{item.action}
              {item.target && (
                <span className="font-medium text-slate-900 dark:text-white">
                  {' '}{item.target}
                </span>
              )}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {formatTimestamp(item.timestamp)}
            </p>
          </div>
        </div>
      ))}

      {items.length > maxItems && onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
        >
          Zobrazit vše ({items.length})
        </button>
      )}
    </div>
  );
}

export default Timeline;
