/**
 * MST Settings Screen - 2026 Glassmorphism Edition
 * 
 * Nastavení aplikace s modaly pro editaci.
 */

import React, { useEffect, useState } from 'react';
import {
  Screen,
  ScreenHeader,
  ScreenContent,
  Card,
  Section,
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Input,
  Button,
  GradientButton,
  AlertModal,
  Toggle,
  Avatar,
} from '../../shared';
import { useSettings } from '../../application';
import { useAuth } from '../auth';

/**
 * Props
 */
export interface SettingsScreenProps {
  appVersion?: string;
}

/**
 * Theme type
 */
type ThemeOption = 'light' | 'dark' | 'system';

/**
 * SettingsScreen Component
 */
export function SettingsScreen({ appVersion = '0.1.0' }: SettingsScreenProps) {
  const { settings, loadSettings, setWorkerName, setTheme, setSyncEnabled } = useSettings();
  const { user, signOut, isConfigured } = useAuth();

  // Modal states
  const [showWorkerNameModal, setShowWorkerNameModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [workerNameInput, setWorkerNameInput] = useState('');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const settingsData = settings.data;

  // Open worker name modal with current value
  const openWorkerNameModal = () => {
    setWorkerNameInput(settingsData?.workerName ?? '');
    setShowWorkerNameModal(true);
  };

  // Save worker name
  const handleSaveWorkerName = async () => {
    await setWorkerName(workerNameInput.trim());
    setShowWorkerNameModal(false);
  };

  // Handle theme change
  const handleThemeChange = async (theme: ThemeOption) => {
    await setTheme(theme);
    applyTheme(theme);
    setShowThemeModal(false);
  };

  // Apply theme to document
  const applyTheme = (theme: ThemeOption) => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  };

  // Handle clear data
  const handleClearData = async () => {
    try {
      // Clear IndexedDB
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }
      // Clear localStorage
      localStorage.clear();
      // Reload app
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  return (
    <Screen
      header={
        <ScreenHeader
          title="Nastavení"
          largeTitle
        />
      }
    >
      <ScreenContent className="space-y-6 pb-8">
        {/* Profile Section */}
        <Section title="Profil">
          <Card variant="glass" padding="none">
            <button
              onClick={openWorkerNameModal}
              className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <Avatar
                name={settingsData?.workerName || user?.name || '?'}
                size="lg"
              />
              <div className="flex-1 text-left">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {settingsData?.workerName || 'Nastavit jméno'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {user?.email || 'Jméno pro záznamy práce'}
                </p>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-slate-400" />
            </button>
          </Card>
        </Section>

        {/* Appearance Section */}
        <Section title="Vzhled">
          <Card variant="glass" padding="none">
            <button
              onClick={() => setShowThemeModal(true)}
              className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <MoonIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-slate-900 dark:text-white">Tmavý režim</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {getThemeLabel(settingsData?.theme ?? 'system')}
                </p>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-slate-400" />
            </button>
          </Card>
        </Section>

        {/* Sync Section */}
        <Section title="Synchronizace">
          <Card variant="glass" padding="none">
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                <CloudIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">Auto-sync</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Synchronizovat při připojení
                </p>
              </div>
              <Toggle
                checked={settingsData?.syncEnabled ?? false}
                onChange={(e) => setSyncEnabled(e.target.checked)}
              />
            </div>

            <div className="border-t border-slate-200/50 dark:border-slate-700/50" />

            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ServerIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">Firebase</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isConfigured ? 'Připojeno' : 'Nepřipojeno'}
                </p>
              </div>
              <StatusDot connected={isConfigured} />
            </div>
          </Card>
        </Section>

        {/* Account Section */}
        {user && (
          <Section title="Účet">
            <Card variant="glass" padding="none">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
                  <LogoutIcon className="w-5 h-5 text-error-600 dark:text-error-400" />
                </div>
                <p className="font-medium text-error-600 dark:text-error-400">Odhlásit se</p>
              </button>
            </Card>
          </Section>
        )}

        {/* About Section */}
        <Section title="O aplikaci">
          <Card variant="glass" padding="none">
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Verze</span>
                <span className="font-medium text-slate-900 dark:text-white">{appVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Název</span>
                <span className="font-medium text-slate-900 dark:text-white">MST - Marty Solar Tracker</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Typ</span>
                <span className="font-medium text-slate-900 dark:text-white">Offline-first PWA</span>
              </div>
            </div>
          </Card>
        </Section>

        {/* Danger Zone */}
        <Section title="Nebezpečná zóna">
          <Card variant="outline" className="border-error-200 dark:border-error-800" padding="none">
            <button
              onClick={() => setShowClearDataModal(true)}
              className="w-full flex items-center gap-4 p-4 hover:bg-error-50 dark:hover:bg-error-900/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
                <TrashIcon className="w-5 h-5 text-error-600 dark:text-error-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-error-600 dark:text-error-400">Vymazat všechna data</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tato akce je nevratná</p>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-error-400" />
            </button>
          </Card>
        </Section>
      </ScreenContent>

      {/* Worker Name Modal */}
      <Modal
        isOpen={showWorkerNameModal}
        onClose={() => setShowWorkerNameModal(false)}
        size="sm"
      >
        <ModalHeader
          title="Jméno pracovníka"
          subtitle="Toto jméno se zobrazí u záznamů práce"
          onClose={() => setShowWorkerNameModal(false)}
        />
        <ModalContent>
          <Input
            label="Vaše jméno"
            placeholder="např. Jan Novák"
            value={workerNameInput}
            onChange={(e) => setWorkerNameInput(e.target.value)}
            variant="solid"
            autoFocus
          />
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowWorkerNameModal(false)}>
            Zrušit
          </Button>
          <GradientButton gradient="brand" onClick={handleSaveWorkerName}>
            Uložit
          </GradientButton>
        </ModalFooter>
      </Modal>

      {/* Theme Modal */}
      <Modal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        size="sm"
      >
        <ModalHeader
          title="Tmavý režim"
          onClose={() => setShowThemeModal(false)}
        />
        <ModalContent className="space-y-2">
          <ThemeOptionButton
            label="Světlý"
            description="Vždy světlý režim"
            icon={<SunIcon className="w-5 h-5" />}
            selected={settingsData?.theme === 'light'}
            onClick={() => handleThemeChange('light')}
          />
          <ThemeOptionButton
            label="Tmavý"
            description="Vždy tmavý režim"
            icon={<MoonIcon className="w-5 h-5" />}
            selected={settingsData?.theme === 'dark'}
            onClick={() => handleThemeChange('dark')}
          />
          <ThemeOptionButton
            label="Systémový"
            description="Podle nastavení zařízení"
            icon={<DeviceIcon className="w-5 h-5" />}
            selected={settingsData?.theme === 'system' || !settingsData?.theme}
            onClick={() => handleThemeChange('system')}
          />
        </ModalContent>
      </Modal>

      {/* Clear Data Modal */}
      <AlertModal
        isOpen={showClearDataModal}
        onClose={() => setShowClearDataModal(false)}
        onConfirm={handleClearData}
        title="Vymazat všechna data?"
        message="Tato akce smaže všechny projekty, záznamy práce a nastavení. Data nelze obnovit."
        confirmText="Vymazat vše"
        cancelText="Zrušit"
        variant="danger"
      />
    </Screen>
  );
}

/**
 * Theme Option Button Component
 */
function ThemeOptionButton({
  label,
  description,
  icon,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 p-4 rounded-xl transition-all
        ${selected
          ? 'bg-brand-100 dark:bg-brand-900/30 ring-2 ring-brand-500'
          : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
        }
      `}
    >
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center
        ${selected
          ? 'bg-brand-500 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
        }
      `}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className={`font-medium ${selected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-900 dark:text-white'}`}>
          {label}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {selected && (
        <CheckIcon className="w-5 h-5 text-brand-500" />
      )}
    </button>
  );
}

/**
 * Status Dot
 */
function StatusDot({ connected }: { connected: boolean }) {
  return (
    <div className={`
      w-3 h-3 rounded-full
      ${connected ? 'bg-success-500' : 'bg-slate-300 dark:bg-slate-600'}
    `} />
  );
}

/**
 * Helpers
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

function getThemeLabel(theme: ThemeOption): string {
  switch (theme) {
    case 'light': return 'Světlý';
    case 'dark': return 'Tmavý';
    case 'system': return 'Podle systému';
    default: return 'Podle systému';
  }
}

/**
 * Icons
 */
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
    </svg>
  );
}

function DeviceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z" clipRule="evenodd" />
    </svg>
  );
}

function ServerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default SettingsScreen;
