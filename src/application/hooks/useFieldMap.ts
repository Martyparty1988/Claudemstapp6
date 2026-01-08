/**
 * MST Hook - useFieldMap
 * 
 * Hook pro FieldMap - hlavní pracovní režim.
 * Orchestruje celý flow: načtení → výběr → potvrzení → zápis.
 * 
 * PRAVIDLA:
 * - Kliknutí na stůl POUZE mění UI stav (selection)
 * - Data se zapisují POUZE po potvrzení v bottom-sheetu
 * - FieldMap NIKDY přímo neukládá data
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getProjectRepository,
  getTableRepository,
  getWorkRecordRepository,
} from '../../data';
import type { WorkType, TableWithWorkState } from '../../domain';
import { WORK_STATUS } from '../../domain';
import type {
  FieldMapVM,
  FieldMapSelectionVM,
  WorkConfirmationSheetVM,
  TableCellVM,
} from '../view-models';
import { EMPTY_SELECTION, DEFAULT_WORK_CONFIRMATION } from '../view-models';
import {
  mapToFieldMapVM,
  mapToSelectionVM,
  calculateSelectionSummary,
  mapTableToCell,
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
 * Return type pro useFieldMap hook
 */
export interface UseFieldMapReturn {
  // Data state
  readonly fieldMap: AsyncState<FieldMapVM>;

  // Selection state (UI only, žádný zápis)
  readonly selection: FieldMapSelectionVM;

  // Bottom sheet state
  readonly confirmationSheet: WorkConfirmationSheetVM;

  // Mutation state
  readonly submitMutation: MutationState;

  // Selection actions (pouze UI stav)
  readonly selectTable: (tableId: string) => void;
  readonly deselectTable: (tableId: string) => void;
  readonly toggleTableSelection: (tableId: string) => void;
  readonly selectMultiple: (tableIds: readonly string[]) => void;
  readonly clearSelection: () => void;
  readonly selectAllPending: () => void;

  // Sheet actions
  readonly openConfirmationSheet: () => void;
  readonly closeConfirmationSheet: () => void;
  readonly setWorkType: (workType: WorkType) => void;
  readonly setNotes: (notes: string) => void;

  // Submit action (jediný zápis dat)
  readonly submitWork: () => Promise<void>;

  // Refresh
  readonly refresh: () => Promise<void>;
}

/**
 * Hook pro FieldMap
 */
export function useFieldMap(projectId: string): UseFieldMapReturn {
  // Data state
  const [fieldMap, setFieldMap] = useState<AsyncState<FieldMapVM>>(idleState());
  const [tables, setTables] = useState<readonly TableWithWorkState[]>([]);

  // Selection state (pouze UI)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [workType, setWorkType] = useState<WorkType>('installation');
  const [notes, setNotes] = useState('');

  // Mutation state
  const [submitMutation, setSubmitMutation] = useState<MutationState>(defaultMutationState());

  // Repositories
  const projectRepo = getProjectRepository();
  const tableRepo = getTableRepository();
  const workRecordRepo = getWorkRecordRepository();

  /**
   * Načte data pro FieldMap
   */
  const loadFieldMap = useCallback(async () => {
    setFieldMap(loadingState(fieldMap.data));

    try {
      // Načteme projekt
      const projectResult = await projectRepo.getById(projectId);
      if (!projectResult.success) {
        setFieldMap(errorState(projectResult.error.message));
        return;
      }

      // Načteme stoly s work state
      const tablesResult = await tableRepo.getTablesWithWorkState(projectId);
      if (!tablesResult.success) {
        setFieldMap(errorState(tablesResult.error.message));
        return;
      }

      // Uložíme raw tables pro selection výpočty
      setTables(tablesResult.data);

      // Spočítáme dnešní dokončené
      const todayRecordsResult = await workRecordRepo.getTodayRecords(projectId);
      let todayCompleted = 0;
      if (todayRecordsResult.success) {
        for (const record of todayRecordsResult.data) {
          if (record.status === WORK_STATUS.completed) {
            todayCompleted += record.tableIds.length;
          }
        }
      }

      // Mapujeme na view-model
      const vm = mapToFieldMapVM(
        projectResult.data,
        tablesResult.data,
        selectedIds,
        todayCompleted
      );

      setFieldMap(successState(vm));
    } catch (error) {
      setFieldMap(errorState(String(error)));
    }
  }, [projectId, projectRepo, tableRepo, workRecordRepo, selectedIds, fieldMap.data]);

  // Initial load
  useEffect(() => {
    loadFieldMap();
  }, [projectId]); // Pouze při změně projectId, ne loadFieldMap

  /**
   * Computed selection state
   */
  const selection = useMemo<FieldMapSelectionVM>(() => {
    return mapToSelectionVM(tables, selectedIds);
  }, [tables, selectedIds]);

  /**
   * Computed confirmation sheet state
   */
  const confirmationSheet = useMemo<WorkConfirmationSheetVM>(() => {
    const selectedTables = tables
      .filter((t) => selectedIds.has(t.id))
      .map((t) => mapTableToCell(t, true));

    const summary = calculateSelectionSummary(
      tables.filter((t) => selectedIds.has(t.id))
    );

    return {
      isOpen: isSheetOpen,
      selectedTables,
      summary,
      workType,
      notes,
      canSubmit: selectedIds.size > 0 && !submitMutation.isLoading,
    };
  }, [tables, selectedIds, isSheetOpen, workType, notes, submitMutation.isLoading]);

  // === SELECTION ACTIONS (pouze UI stav) ===

  const selectTable = useCallback((tableId: string) => {
    setSelectedIds((prev) => new Set([...prev, tableId]));
  }, []);

  const deselectTable = useCallback((tableId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(tableId);
      return next;
    });
  }, []);

  const toggleTableSelection = useCallback((tableId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(tableId)) {
        next.delete(tableId);
      } else {
        next.add(tableId);
      }
      return next;
    });
  }, []);

  const selectMultiple = useCallback((tableIds: readonly string[]) => {
    setSelectedIds((prev) => new Set([...prev, ...tableIds]));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectAllPending = useCallback(() => {
    const pendingIds = tables
      .filter((t) => t.workState.status === WORK_STATUS.pending)
      .map((t) => t.id);
    setSelectedIds(new Set(pendingIds));
  }, [tables]);

  // === SHEET ACTIONS ===

  const openConfirmationSheet = useCallback(() => {
    if (selectedIds.size > 0) {
      setIsSheetOpen(true);
    }
  }, [selectedIds.size]);

  const closeConfirmationSheet = useCallback(() => {
    setIsSheetOpen(false);
    setNotes('');
  }, []);

  const handleSetWorkType = useCallback((type: WorkType) => {
    setWorkType(type);
  }, []);

  const handleSetNotes = useCallback((value: string) => {
    setNotes(value);
  }, []);

  // === SUBMIT (jediný zápis dat) ===

  const submitWork = useCallback(async () => {
    if (selectedIds.size === 0) return;

    setSubmitMutation({ isLoading: true, error: null });

    try {
      const result = await workRecordRepo.createWorkRecord({
        projectId,
        tableIds: Array.from(selectedIds),
        workType,
        status: WORK_STATUS.completed,
        notes: notes || undefined,
      });

      if (!result.success) {
        setSubmitMutation({ isLoading: false, error: result.error.message });
        return;
      }

      // Success - reset UI state
      setSubmitMutation({ isLoading: false, error: null });
      setSelectedIds(new Set());
      setIsSheetOpen(false);
      setNotes('');

      // Refresh data
      await loadFieldMap();
    } catch (error) {
      setSubmitMutation({ isLoading: false, error: String(error) });
    }
  }, [projectId, selectedIds, workType, notes, workRecordRepo, loadFieldMap]);

  // === REFRESH ===

  const refresh = useCallback(async () => {
    await loadFieldMap();
  }, [loadFieldMap]);

  return {
    fieldMap,
    selection,
    confirmationSheet,
    submitMutation,
    selectTable,
    deselectTable,
    toggleTableSelection,
    selectMultiple,
    clearSelection,
    selectAllPending,
    openConfirmationSheet,
    closeConfirmationSheet,
    setWorkType: handleSetWorkType,
    setNotes: handleSetNotes,
    submitWork,
    refresh,
  };
}
