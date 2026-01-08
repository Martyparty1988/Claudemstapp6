/**
 * MST Connectivity Banner
 * 
 * Vylepšený indikátor online/offline stavu s animacemi.
 */

import React, { useState, useEffect, useCallback } from 'react';

/**
 * Connection status
 */
export type ConnectionStatus = 'online' | 'offline' | 'slow' | 'reconnecting';

/**
 * useConnectivity hook
 */
export function useConnectivity() {
  const [status, setStatus] = useState<ConnectionStatus>(
    navigator.onLine ? 'online' : 'offline'
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);

  useEffect(() => {
    let reconnectTimeout: number;
    let hideBannerTimeout: number;

    const handleOnline = () => {
      if (wasOffline) {
        // Show "reconnecting" briefly
        setStatus('reconnecting');
        setShowBanner(true);
        
        reconnectTimeout = window.setTimeout(() => {
          setStatus('online');
          
          // Hide banner after showing "online" for a moment
          hideBannerTimeout = window.setTimeout(() => {
            setShowBanner(false);
            setWasOffline(false);
          }, 2000);
        }, 1000);
      } else {
        setStatus('online');
        setShowBanner(false);
      }
    };

    const handleOffline = () => {
      setStatus('offline');
      setWasOffline(true);
      setShowBanner(true);
    };

    // Connection quality check (optional)
    const checkConnectionQuality = async () => {
      if (!navigator.onLine) return;
      
      try {
        const start = performance.now();
        await fetch('/favicon.ico', { cache: 'no-store', mode: 'no-cors' });
        const latency = performance.now() - start;
        
        if (latency > 3000 && status !== 'slow') {
          setStatus('slow');
          setShowBanner(true);
        } else if (latency < 1000 && status === 'slow') {
          setStatus('online');
          setShowBanner(false);
        }
      } catch {
        // Ignore errors
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    if (!navigator.onLine) {
      handleOffline();
    }

    // Periodic connection quality check
    const qualityInterval = setInterval(checkConnectionQuality, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(reconnectTimeout);
      clearTimeout(hideBannerTimeout);
      clearInterval(qualityInterval);
    };
  }, [wasOffline, status]);

  const dismissBanner = useCallback(() => {
    if (status !== 'offline') {
      setShowBanner(false);
    }
  }, [status]);

  return {
    status,
    isOnline: status === 'online' || status === 'slow',
    isOffline: status === 'offline',
    showBanner,
    dismissBanner,
  };
}

/**
 * ConnectivityBanner Props
 */
export interface ConnectivityBannerProps {
  className?: string;
  position?: 'top' | 'bottom';
}

/**
 * ConnectivityBanner Component
 */
export function ConnectivityBanner({
  className = '',
  position = 'top',
}: ConnectivityBannerProps) {
  const { status, showBanner, dismissBanner } = useConnectivity();

  if (!showBanner) return null;

  const config = getBannerConfig(status);

  return (
    <div
      className={`
        fixed left-0 right-0 z-50
        ${position === 'top' ? 'top-0' : 'bottom-20'}
        animate-slide-down
        ${className}
      `}
    >
      <div
        className={`
          mx-4 mt-4 px-4 py-3
          rounded-xl
          flex items-center gap-3
          backdrop-blur-glass
          shadow-glass
          ${config.bgClass}
        `}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.iconClass}`}>
          {config.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${config.textClass}`}>
            {config.title}
          </p>
          {config.subtitle && (
            <p className={`text-sm opacity-80 ${config.textClass}`}>
              {config.subtitle}
            </p>
          )}
        </div>

        {/* Dismiss button (only for non-offline states) */}
        {status !== 'offline' && (
          <button
            onClick={dismissBanner}
            className={`
              flex-shrink-0 p-1.5 rounded-lg
              hover:bg-white/20 dark:hover:bg-black/20
              transition-colors
              ${config.textClass}
            `}
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Compact Connectivity Indicator (for headers)
 */
export function ConnectivityIndicator({ className = '' }: { className?: string }) {
  const { status, isOffline } = useConnectivity();

  if (!isOffline && status !== 'slow' && status !== 'reconnecting') {
    return null;
  }

  const config = getIndicatorConfig(status);

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1
        rounded-full text-xs font-medium
        ${config.bgClass} ${config.textClass}
        ${className}
      `}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotClass} ${status === 'reconnecting' ? 'animate-pulse' : ''}`} />
      {config.label}
    </div>
  );
}

/**
 * Floating Connectivity Dot (minimal indicator)
 */
export function ConnectivityDot({ className = '' }: { className?: string }) {
  const { status, isOffline } = useConnectivity();

  if (!isOffline && status !== 'reconnecting') {
    return null;
  }

  return (
    <div
      className={`
        w-3 h-3 rounded-full
        ${status === 'offline' 
          ? 'bg-error-500' 
          : status === 'reconnecting'
            ? 'bg-warning-500 animate-pulse'
            : 'bg-success-500'
        }
        ${className}
      `}
      title={status === 'offline' ? 'Offline' : 'Připojování...'}
    />
  );
}

/**
 * Helper functions
 */
interface BannerConfig {
  bgClass: string;
  textClass: string;
  iconClass: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

function getBannerConfig(status: ConnectionStatus): BannerConfig {
  switch (status) {
    case 'offline':
      return {
        bgClass: 'bg-error-500/90 dark:bg-error-600/90',
        textClass: 'text-white',
        iconClass: 'text-white',
        icon: <WifiOffIcon className="w-5 h-5" />,
        title: 'Jste offline',
        subtitle: 'Data budou synchronizována po obnovení připojení',
      };
    case 'slow':
      return {
        bgClass: 'bg-warning-500/90 dark:bg-warning-600/90',
        textClass: 'text-white',
        iconClass: 'text-white',
        icon: <WifiSlowIcon className="w-5 h-5" />,
        title: 'Pomalé připojení',
        subtitle: 'Některé funkce mohou být pomalejší',
      };
    case 'reconnecting':
      return {
        bgClass: 'bg-brand-500/90 dark:bg-brand-600/90',
        textClass: 'text-white',
        iconClass: 'text-white animate-spin',
        icon: <RefreshIcon className="w-5 h-5" />,
        title: 'Připojování...',
      };
    case 'online':
    default:
      return {
        bgClass: 'bg-success-500/90 dark:bg-success-600/90',
        textClass: 'text-white',
        iconClass: 'text-white',
        icon: <WifiIcon className="w-5 h-5" />,
        title: 'Připojeno',
        subtitle: 'Jste zpět online',
      };
  }
}

interface IndicatorConfig {
  bgClass: string;
  textClass: string;
  dotClass: string;
  label: string;
}

function getIndicatorConfig(status: ConnectionStatus): IndicatorConfig {
  switch (status) {
    case 'offline':
      return {
        bgClass: 'bg-error-100 dark:bg-error-900/30',
        textClass: 'text-error-700 dark:text-error-400',
        dotClass: 'bg-error-500',
        label: 'Offline',
      };
    case 'slow':
      return {
        bgClass: 'bg-warning-100 dark:bg-warning-900/30',
        textClass: 'text-warning-700 dark:text-warning-400',
        dotClass: 'bg-warning-500',
        label: 'Pomalé',
      };
    case 'reconnecting':
      return {
        bgClass: 'bg-brand-100 dark:bg-brand-900/30',
        textClass: 'text-brand-700 dark:text-brand-400',
        dotClass: 'bg-brand-500',
        label: 'Připojování',
      };
    case 'online':
    default:
      return {
        bgClass: 'bg-success-100 dark:bg-success-900/30',
        textClass: 'text-success-700 dark:text-success-400',
        dotClass: 'bg-success-500',
        label: 'Online',
      };
  }
}

/**
 * Icons
 */
function WifiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
    </svg>
  );
}

function WifiOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M12 18.75l-.53.53a.75.75 0 01-1.06 0M8.288 15.038A5.25 5.25 0 0112 13.5m3.758 1.538a5.25 5.25 0 00-3.03-1.476M5.106 11.856a9.742 9.742 0 014.815-2.548m5.478.563a9.742 9.742 0 013.495 1.985M1.924 8.674a15.712 15.712 0 014.245-2.728m9.96 1.098a15.712 15.712 0 015.947 1.63" />
    </svg>
  );
}

function WifiSlowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75l-.53.53a.75.75 0 01-1.06 0M8.288 15.038a5.25 5.25 0 017.424 0" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" d="M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default ConnectivityBanner;
