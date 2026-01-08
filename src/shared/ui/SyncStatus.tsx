/**
 * MST SyncStatusIndicator Component
 * 
 * Indikátor stavu synchronizace v UI.
 */

import React from 'react';
import { useSync } from '../../application/hooks/useSync';

/**
 * SyncStatusIndicator - kompaktní verze pro header
 */
export function SyncStatusIndicator() {
  const { status, isConfigured, forceSync } = useSync();

  // Pokud není Firebase nakonfigurován, nezobrazovat
  if (!isConfigured) {
    return null;
  }

  // Syncing
  if (status.isSyncing) {
    return (
      <div className="flex items-center gap-1.5 text-ios-blue">
        <SyncingIcon className="w-4 h-4 animate-spin" />
        <span className="text-ios-caption2">Synchronizuji...</span>
      </div>
    );
  }

  // Pending changes
  if (status.pendingCount > 0) {
    return (
      <button
        onClick={() => forceSync()}
        className="flex items-center gap-1.5 text-ios-orange touch-feedback"
      >
        <PendingIcon className="w-4 h-4" />
        <span className="text-ios-caption2">{status.pendingCount} čeká</span>
      </button>
    );
  }

  // Offline
  if (!status.isOnline) {
    return (
      <div className="flex items-center gap-1.5 text-ios-gray">
        <OfflineIcon className="w-4 h-4" />
        <span className="text-ios-caption2">Offline</span>
      </div>
    );
  }

  // All synced
  return (
    <div className="flex items-center gap-1.5 text-ios-green">
      <SyncedIcon className="w-4 h-4" />
      <span className="text-ios-caption2">Synchronizováno</span>
    </div>
  );
}

/**
 * SyncStatusBadge - pro Settings screen
 */
export function SyncStatusBadge() {
  const { status, isConfigured, forceSync } = useSync();

  if (!isConfigured) {
    return (
      <div className="bg-ios-gray-5 rounded-ios p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ios-gray-4 flex items-center justify-center">
            <CloudOffIcon className="w-5 h-5 text-ios-gray" />
          </div>
          <div>
            <p className="text-ios-body font-medium text-gray-900">Cloud sync vypnutý</p>
            <p className="text-ios-caption1 text-ios-gray">
              Nastavte Firebase pro synchronizaci
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-ios-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${status.isSyncing ? 'bg-ios-blue/10' :
              status.pendingCount > 0 ? 'bg-ios-orange/10' :
              !status.isOnline ? 'bg-ios-gray-4' :
              'bg-ios-green/10'}
          `}>
            {status.isSyncing ? (
              <SyncingIcon className="w-5 h-5 text-ios-blue animate-spin" />
            ) : status.pendingCount > 0 ? (
              <PendingIcon className="w-5 h-5 text-ios-orange" />
            ) : !status.isOnline ? (
              <OfflineIcon className="w-5 h-5 text-ios-gray" />
            ) : (
              <SyncedIcon className="w-5 h-5 text-ios-green" />
            )}
          </div>
          <div>
            <p className="text-ios-body font-medium text-gray-900">
              {status.isSyncing ? 'Synchronizuji...' :
               status.pendingCount > 0 ? `${status.pendingCount} změn čeká` :
               !status.isOnline ? 'Offline' :
               'Synchronizováno'}
            </p>
            <p className="text-ios-caption1 text-ios-gray">
              {status.lastSyncAt
                ? `Poslední sync: ${status.lastSyncAt.toLocaleTimeString('cs-CZ')}`
                : 'Zatím nesynchronizováno'}
            </p>
          </div>
        </div>

        {(status.pendingCount > 0 || !status.isSyncing) && status.isOnline && (
          <button
            onClick={() => forceSync()}
            disabled={status.isSyncing}
            className="px-3 py-1.5 bg-ios-blue text-white text-ios-footnote font-medium rounded-ios touch-feedback disabled:opacity-50"
          >
            Sync
          </button>
        )}
      </div>

      {status.error && (
        <div className="mt-3 p-2 bg-ios-red/10 rounded-ios">
          <p className="text-ios-caption1 text-ios-red">{status.error}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Icons
 */
function SyncingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function PendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function OfflineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
    </svg>
  );
}

function SyncedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CloudOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
}
