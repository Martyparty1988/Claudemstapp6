/**
 * MST Hook - useSettings
 * 
 * Hook pro aplikační nastavení.
 */

import { useState, useEffect, useCallback } from 'react';
import { getSettingsRepository, SETTINGS_KEYS } from '../../data';
import type { WorkType } from '../../domain';
import type { AsyncState } from '../types/async-state.types';
import {
  idleState,
  loadingState,
  successState,
  errorState,
} from '../types/async-state.types';

/**
 * App settings view-model
 */
export interface AppSettingsVM {
  readonly workerName: string | null;
  readonly lastActiveProjectId: string | null;
  readonly defaultWorkType: WorkType;
  readonly theme: 'light' | 'dark' | 'system';
  readonly syncEnabled: boolean;
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: AppSettingsVM = {
  workerName: null,
  lastActiveProjectId: null,
  defaultWorkType: 'installation',
  theme: 'system',
  syncEnabled: false,
};

/**
 * Return type pro useSettings hook
 */
export interface UseSettingsReturn {
  readonly settings: AsyncState<AppSettingsVM>;
  readonly loadSettings: () => Promise<void>;
  readonly setWorkerName: (name: string) => Promise<void>;
  readonly setLastActiveProject: (projectId: string) => Promise<void>;
  readonly setDefaultWorkType: (workType: WorkType) => Promise<void>;
  readonly setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  readonly setSyncEnabled: (enabled: boolean) => Promise<void>;
}

/**
 * Hook pro settings
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AsyncState<AppSettingsVM>>(idleState());

  const settingsRepo = getSettingsRepository();

  /**
   * Načte všechna nastavení
   */
  const loadSettings = useCallback(async () => {
    setSettings(loadingState(settings.data));

    try {
      const result = await settingsRepo.getMany<{
        workerName: string;
        lastActiveProject: string;
        defaultWorkType: WorkType;
        theme: 'light' | 'dark' | 'system';
        syncEnabled: boolean;
      }>([
        SETTINGS_KEYS.WORKER_NAME,
        SETTINGS_KEYS.LAST_ACTIVE_PROJECT,
        SETTINGS_KEYS.DEFAULT_WORK_TYPE,
        SETTINGS_KEYS.THEME,
        SETTINGS_KEYS.SYNC_ENABLED,
      ]);

      if (!result.success) {
        setSettings(errorState(result.error.message));
        return;
      }

      const data = result.data;

      setSettings(successState({
        workerName: data.workerName ?? DEFAULT_SETTINGS.workerName,
        lastActiveProjectId: data.lastActiveProject ?? DEFAULT_SETTINGS.lastActiveProjectId,
        defaultWorkType: data.defaultWorkType ?? DEFAULT_SETTINGS.defaultWorkType,
        theme: data.theme ?? DEFAULT_SETTINGS.theme,
        syncEnabled: data.syncEnabled ?? DEFAULT_SETTINGS.syncEnabled,
      }));
    } catch (error) {
      setSettings(errorState(String(error)));
    }
  }, [settingsRepo, settings.data]);

  // Initial load
  useEffect(() => {
    loadSettings();
  }, []); // Pouze jednou při mount

  /**
   * Helper pro update jednotlivého nastavení
   */
  const updateSetting = useCallback(async <K extends keyof AppSettingsVM>(
    key: string,
    field: K,
    value: AppSettingsVM[K]
  ) => {
    try {
      await settingsRepo.set(key, value);

      setSettings((prev) => {
        if (!prev.data) return prev;
        return successState({
          ...prev.data,
          [field]: value,
        });
      });
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  }, [settingsRepo]);

  const setWorkerName = useCallback(async (name: string) => {
    await updateSetting(SETTINGS_KEYS.WORKER_NAME, 'workerName', name || null);
  }, [updateSetting]);

  const setLastActiveProject = useCallback(async (projectId: string) => {
    await updateSetting(SETTINGS_KEYS.LAST_ACTIVE_PROJECT, 'lastActiveProjectId', projectId);
  }, [updateSetting]);

  const setDefaultWorkType = useCallback(async (workType: WorkType) => {
    await updateSetting(SETTINGS_KEYS.DEFAULT_WORK_TYPE, 'defaultWorkType', workType);
  }, [updateSetting]);

  const setTheme = useCallback(async (theme: 'light' | 'dark' | 'system') => {
    // Save to localStorage for immediate access on app start
    localStorage.setItem('mst-theme', theme);
    await updateSetting(SETTINGS_KEYS.THEME, 'theme', theme);
  }, [updateSetting]);

  const setSyncEnabled = useCallback(async (enabled: boolean) => {
    await updateSetting(SETTINGS_KEYS.SYNC_ENABLED, 'syncEnabled', enabled);
  }, [updateSetting]);

  return {
    settings,
    loadSettings,
    setWorkerName,
    setLastActiveProject,
    setDefaultWorkType,
    setTheme,
    setSyncEnabled,
  };
}
