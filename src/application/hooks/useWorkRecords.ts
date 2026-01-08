/**
 * MST Hook - useWorkRecords
 * 
 * Hook pro správu pracovních záznamů a historie.
 */

import { useState, useCallback } from 'react';
import {
  getWorkRecordRepository,
  getProjectRepository,
} from '../../data';
import type { WorkType, WorkStatus, TimeRange } from '../../domain';
import type {
  WorkRecordListItemVM,
  WorkRecordDetailVM,
  GroupedWorkRecordsVM,
  WorkStatisticsVM,
} from '../view-models';
import {
  mapWorkRecordToListItem,
  mapWorkRecordToDetail,
  mapToGroupedWorkRecords,
  calculateWorkStatistics,
} from '../mappers';
import type { AsyncState, MutationState } from '../types/async-state.types';
import {
  idleState,
  loadingState,
  successState,
  errorState,
  defaultMutationState,
} from '../types/async-state.types';

/**
 * Options pro načítání work records
 */
export interface WorkRecordFilterOptions {
  readonly projectId?: string;
  readonly workType?: WorkType;
  readonly status?: WorkStatus;
  readonly timeRange?: TimeRange;
  readonly limit?: number;
}

/**
 * Return type pro useWorkRecords hook
 */
export interface UseWorkRecordsReturn {
  // State
  readonly records: AsyncState<GroupedWorkRecordsVM>;
  readonly activeRecord: AsyncState<WorkRecordDetailVM | null>;
  readonly statistics: AsyncState<WorkStatisticsVM>;

  // Mutations
  readonly deleteMutation: MutationState;

  // Actions
  readonly loadRecords: (options?: WorkRecordFilterOptions) => Promise<void>;
  readonly loadRecordDetail: (recordId: string) => Promise<void>;
  readonly loadStatistics: (projectId: string) => Promise<void>;
  readonly loadTodayRecords: (projectId: string) => Promise<void>;
  readonly deleteRecord: (recordId: string) => Promise<void>;
  readonly refresh: () => Promise<void>;
}

/**
 * Hook pro work records
 */
export function useWorkRecords(initialProjectId?: string): UseWorkRecordsReturn {
  // State
  const [records, setRecords] = useState<AsyncState<GroupedWorkRecordsVM>>(idleState());
  const [activeRecord, setActiveRecord] = useState<AsyncState<WorkRecordDetailVM | null>>(idleState());
  const [statistics, setStatistics] = useState<AsyncState<WorkStatisticsVM>>(idleState());

  // Mutation state
  const [deleteMutation, setDeleteMutation] = useState<MutationState>(defaultMutationState());

  // Current filter (pro refresh)
  const [currentFilter, setCurrentFilter] = useState<WorkRecordFilterOptions>({
    projectId: initialProjectId,
  });

  // Repositories
  const workRecordRepo = getWorkRecordRepository();
  const projectRepo = getProjectRepository();

  /**
   * Získá názvy projektů pro záznamy
   */
  const getProjectNamesMap = useCallback(async (
    projectIds: readonly string[]
  ): Promise<Map<string, string>> => {
    const uniqueIds = [...new Set(projectIds)];
    const namesMap = new Map<string, string>();

    for (const id of uniqueIds) {
      const result = await projectRepo.getById(id);
      if (result.success) {
        namesMap.set(id, result.data.name);
      }
    }

    return namesMap;
  }, [projectRepo]);

  /**
   * Načte work records s filtrováním
   */
  const loadRecords = useCallback(async (options: WorkRecordFilterOptions = {}) => {
    setRecords(loadingState(records.data));
    setCurrentFilter(options);

    try {
      const result = await workRecordRepo.listWorkRecords({
        projectId: options.projectId,
        workType: options.workType,
        status: options.status,
        timeRange: options.timeRange,
        limit: options.limit ?? 100,
      });

      if (!result.success) {
        setRecords(errorState(result.error.message));
        return;
      }

      // Získáme názvy projektů
      const projectIds = result.data.items.map((r) => r.projectId);
      const namesMap = await getProjectNamesMap(projectIds);

      // Mapujeme na grouped view-model
      const grouped = mapToGroupedWorkRecords(
        result.data.items,
        namesMap,
        result.data.hasMore
      );

      setRecords(successState(grouped));
    } catch (error) {
      setRecords(errorState(String(error)));
    }
  }, [workRecordRepo, getProjectNamesMap, records.data]);

  /**
   * Načte detail work recordu
   */
  const loadRecordDetail = useCallback(async (recordId: string) => {
    setActiveRecord(loadingState(activeRecord.data));

    try {
      const result = await workRecordRepo.getById(recordId);

      if (!result.success) {
        setActiveRecord(errorState(result.error.message));
        return;
      }

      // Získáme název projektu
      const projectResult = await projectRepo.getById(result.data.projectId);
      const projectName = projectResult.success ? projectResult.data.name : 'Projekt';

      const detail = mapWorkRecordToDetail(result.data, projectName);
      setActiveRecord(successState(detail));
    } catch (error) {
      setActiveRecord(errorState(String(error)));
    }
  }, [workRecordRepo, projectRepo, activeRecord.data]);

  /**
   * Načte statistiky pro projekt
   */
  const loadStatistics = useCallback(async (projectId: string) => {
    setStatistics(loadingState(statistics.data));

    try {
      const result = await workRecordRepo.getByProjectId(projectId);

      if (!result.success) {
        setStatistics(errorState(result.error.message));
        return;
      }

      const stats = calculateWorkStatistics(result.data);
      setStatistics(successState(stats));
    } catch (error) {
      setStatistics(errorState(String(error)));
    }
  }, [workRecordRepo, statistics.data]);

  /**
   * Načte dnešní záznamy
   */
  const loadTodayRecords = useCallback(async (projectId: string) => {
    setRecords(loadingState(records.data));

    try {
      const result = await workRecordRepo.getTodayRecords(projectId);

      if (!result.success) {
        setRecords(errorState(result.error.message));
        return;
      }

      const namesMap = new Map([[projectId, 'Aktuální projekt']]);
      const grouped = mapToGroupedWorkRecords(result.data, namesMap, false);

      setRecords(successState(grouped));
    } catch (error) {
      setRecords(errorState(String(error)));
    }
  }, [workRecordRepo, records.data]);

  /**
   * Smaže work record
   */
  const deleteRecord = useCallback(async (recordId: string) => {
    setDeleteMutation({ isLoading: true, error: null });

    try {
      const result = await workRecordRepo.delete(recordId);

      if (!result.success) {
        setDeleteMutation({ isLoading: false, error: result.error.message });
        return;
      }

      setDeleteMutation({ isLoading: false, error: null });
      setActiveRecord(successState(null));

      // Refresh seznamu
      await loadRecords(currentFilter);
    } catch (error) {
      setDeleteMutation({ isLoading: false, error: String(error) });
    }
  }, [workRecordRepo, loadRecords, currentFilter]);

  /**
   * Refresh s aktuálním filtrem
   */
  const refresh = useCallback(async () => {
    await loadRecords(currentFilter);
  }, [loadRecords, currentFilter]);

  return {
    records,
    activeRecord,
    statistics,
    deleteMutation,
    loadRecords,
    loadRecordDetail,
    loadStatistics,
    loadTodayRecords,
    deleteRecord,
    refresh,
  };
}
