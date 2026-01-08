/**
 * MST Notification System
 * 
 * Context a hook pro správu notifikací a badge počtů.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

/**
 * Notification types
 */
export interface Notification {
  id: string;
  type: 'chat' | 'project' | 'system' | 'sync';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, unknown>;
}

/**
 * Badge counts by feature
 */
export interface BadgeCounts {
  chat: number;
  projects: number;
  work: number;
  settings: number;
  total: number;
}

/**
 * Notification Context
 */
interface NotificationContextValue {
  notifications: Notification[];
  badges: BadgeCounts;
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  setBadge: (key: keyof Omit<BadgeCounts, 'total'>, count: number) => void;
  incrementBadge: (key: keyof Omit<BadgeCounts, 'total'>) => void;
  clearBadge: (key: keyof Omit<BadgeCounts, 'total'>) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

/**
 * Generate unique ID
 */
function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Notification Provider
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [badges, setBadges] = useState<BadgeCounts>({
    chat: 0,
    projects: 0,
    work: 0,
    settings: 0,
    total: 0,
  });

  // Calculate unread count
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Update total badge when individual badges change
  useEffect(() => {
    const total = badges.chat + badges.projects + badges.work + badges.settings;
    if (badges.total !== total) {
      setBadges((prev) => ({ ...prev, total }));
    }
  }, [badges.chat, badges.projects, badges.work, badges.settings, badges.total]);

  // Add notification
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: generateId(),
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev].slice(0, 100)); // Keep max 100

      // Auto-increment badge based on type
      if (notification.type === 'chat') {
        setBadges((prev) => ({ ...prev, chat: prev.chat + 1 }));
      } else if (notification.type === 'project') {
        setBadges((prev) => ({ ...prev, projects: prev.projects + 1 }));
      }
    },
    []
  );

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Clear all
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Set specific badge
  const setBadge = useCallback(
    (key: keyof Omit<BadgeCounts, 'total'>, count: number) => {
      setBadges((prev) => ({ ...prev, [key]: Math.max(0, count) }));
    },
    []
  );

  // Increment badge
  const incrementBadge = useCallback(
    (key: keyof Omit<BadgeCounts, 'total'>) => {
      setBadges((prev) => ({ ...prev, [key]: prev[key] + 1 }));
    },
    []
  );

  // Clear badge
  const clearBadge = useCallback(
    (key: keyof Omit<BadgeCounts, 'total'>) => {
      setBadges((prev) => ({ ...prev, [key]: 0 }));
    },
    []
  );

  const value: NotificationContextValue = {
    notifications,
    badges,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    setBadge,
    incrementBadge,
    clearBadge,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * useNotifications hook
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

/**
 * Notification List Component
 */
export function NotificationList({
  className = '',
  maxItems = 10,
  onNotificationClick,
}: {
  className?: string;
  maxItems?: number;
  onNotificationClick?: (notification: Notification) => void;
}) {
  const { notifications, markAsRead } = useNotifications();

  const displayNotifications = notifications.slice(0, maxItems);

  if (displayNotifications.length === 0) {
    return (
      <div className={`text-center py-8 text-slate-500 dark:text-slate-400 ${className}`}>
        <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Žádné notifikace</p>
      </div>
    );
  }

  return (
    <div className={`divide-y divide-slate-100 dark:divide-slate-800 ${className}`}>
      {displayNotifications.map((notification) => (
        <button
          key={notification.id}
          onClick={() => {
            markAsRead(notification.id);
            onNotificationClick?.(notification);
          }}
          className={`
            w-full flex items-start gap-3 p-4 text-left
            hover:bg-slate-50 dark:hover:bg-slate-800/50
            transition-colors
            ${!notification.read ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}
          `}
        >
          <div className={`
            flex-shrink-0 w-10 h-10 rounded-full
            flex items-center justify-center
            ${getNotificationColor(notification.type)}
          `}>
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`
                font-medium truncate
                ${notification.read
                  ? 'text-slate-700 dark:text-slate-300'
                  : 'text-slate-900 dark:text-white'
                }
              `}>
                {notification.title}
              </p>
              {!notification.read && (
                <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
              )}
            </div>
            {notification.message && (
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {notification.message}
              </p>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {formatRelativeTime(notification.timestamp)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

/**
 * Notification Badge Component
 */
export function NotificationBadge({
  count,
  max = 99,
  className = '',
  size = 'md',
  pulse = false,
}: {
  count: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}) {
  if (count <= 0) return null;

  const sizeClasses = {
    sm: 'min-w-[16px] h-4 text-[10px] px-1',
    md: 'min-w-[20px] h-5 text-xs px-1.5',
    lg: 'min-w-[24px] h-6 text-sm px-2',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-bold rounded-full
        bg-gradient-to-br from-error-500 to-error-600
        text-white shadow-lg
        ${sizeClasses[size]}
        ${pulse ? 'animate-pulse-soft' : ''}
        ${className}
      `}
    >
      {count > max ? `${max}+` : count}
    </span>
  );
}

/**
 * Helpers
 */
function getNotificationColor(type: Notification['type']): string {
  switch (type) {
    case 'chat':
      return 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400';
    case 'project':
      return 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400';
    case 'sync':
      return 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400';
    case 'system':
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }
}

function getNotificationIcon(type: Notification['type']): React.ReactNode {
  switch (type) {
    case 'chat':
      return <ChatBubbleIcon className="w-5 h-5" />;
    case 'project':
      return <FolderIcon className="w-5 h-5" />;
    case 'sync':
      return <CloudIcon className="w-5 h-5" />;
    case 'system':
    default:
      return <BellIcon className="w-5 h-5" />;
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Právě teď';
  if (minutes < 60) return `Před ${minutes} min`;
  if (hours < 24) return `Před ${hours} hod`;
  if (days < 7) return `Před ${days} dny`;
  return date.toLocaleDateString('cs-CZ');
}

/**
 * Icons
 */
function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
  );
}

export default NotificationProvider;
