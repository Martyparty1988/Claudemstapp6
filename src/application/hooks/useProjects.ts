/**
 * MST Hook - useProjects
 * 
 * Hook pro správu projektů.
 * UI používá POUZE tento hook, nikdy přímo repository.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getProjectRepository,
  getTableRepository,
  getTableWorkStateRepository,
} from '../../data';
import type { CreateProjectDto, UpdateProjectDto, ProjectStatus, CreateTableDto } from '../../domain';
import { calculateProjectStatistics, enrichTableWithWorkState, enrichTableWithCalculations } from '../../domain';
import type { ProjectListItemVM, ProjectDetailVM } from '../view-models';
import {
  mapProjectToListItem,
  mapProjectToDetail,
} from '../mappers';
import type {
  AsyncState,
  MutationState,
  MutationCallbacks,
} from '../types/async-state.types';
import {
  idleState,
  loadingState,
  successState,
  errorState,
  defaultMutationState,
} from '../types/async-state.types';

/**
 * Return type pro useProjects hook
 */
export interface UseProjectsReturn {
  // State
  readonly projects: AsyncState<readonly ProjectListItemVM[]>;
  readonly activeProject: AsyncState<ProjectDetailVM | null>;

  // Mutations
  readonly createMutation: MutationState;
  readonly updateMutation: MutationState;
  readonly deleteMutation: MutationState;

  // Actions
  readonly loadProjects: (status?: ProjectStatus) => Promise<void>;
  readonly loadProjectDetail: (projectId: string) => Promise<void>;
  readonly createProject: (
    dto: CreateProjectDto,
    callbacks?: MutationCallbacks<ProjectDetailVM>
  ) => Promise<void>;
  readonly updateProject: (
    projectId: string,
    dto: UpdateProjectDto,
    callbacks?: MutationCallbacks<ProjectDetailVM>
  ) => Promise<void>;
  readonly deleteProject: (
    projectId: string,
    callbacks?: MutationCallbacks<void>
  ) => Promise<void>;
  readonly refresh: () => Promise<void>;
}

/**
 * Hook pro správu projektů
 */
export function useProjects(): UseProjectsReturn {
  // State
  const [projects, setProjects] = useState<AsyncState<readonly ProjectListItemVM[]>>(idleState());
  const [activeProject, setActiveProject] = useState<AsyncState<ProjectDetailVM | null>>(idleState());

  // Mutation states
  const [createMutation, setCreateMutation] = useState<MutationState>(defaultMutationState());
  const [updateMutation, setUpdateMutation] = useState<MutationState>(defaultMutationState());
  const [deleteMutation, setDeleteMutation] = useState<MutationState>(defaultMutationState());

  // Repositories
  const projectRepo = getProjectRepository();
  const tableRepo = getTableRepository();
  const workStateRepo = getTableWorkStateRepository();

  /**
   * Načte statistiky pro projekt
   */
  const loadProjectStatistics = useCallback(async (projectId: string) => {
    const tablesResult = await tableRepo.getTablesWithWorkState(projectId);
    if (!tablesResult.success) return null;
    return calculateProjectStatistics(tablesResult.data);
  }, [tableRepo]);

  /**
   * Načte seznam projektů
   */
  const loadProjects = useCallback(async (status?: ProjectStatus) => {
    setProjects(loadingState(projects.data));

    try {
      const result = status
        ? await projectRepo.getByStatus(status)
        : await projectRepo.getAll();

      if (!result.success) {
        setProjects(errorState(result.error.message, projects.data));
        return;
      }

      // Načteme statistiky pro každý projekt
      const projectsWithStats = await Promise.all(
        result.data.map(async (project) => {
          const stats = await loadProjectStatistics(project.id);
          return mapProjectToListItem(project, stats ?? undefined);
        })
      );

      setProjects(successState(projectsWithStats));
    } catch (error) {
      setProjects(errorState(String(error), projects.data));
    }
  }, [projectRepo, loadProjectStatistics, projects.data]);

  /**
   * Načte detail projektu
   */
  const loadProjectDetail = useCallback(async (projectId: string) => {
    setActiveProject(loadingState(activeProject.data));

    try {
      const result = await projectRepo.getById(projectId);

      if (!result.success) {
        setActiveProject(errorState(result.error.message));
        return;
      }

      const stats = await loadProjectStatistics(projectId);
      const detail = mapProjectToDetail(result.data, stats ?? undefined);

      setActiveProject(successState(detail));
    } catch (error) {
      setActiveProject(errorState(String(error)));
    }
  }, [projectRepo, loadProjectStatistics, activeProject.data]);

  /**
   * Vytvoří nový projekt
   */
  const createProject = useCallback(async (
    dto: CreateProjectDto,
    callbacks?: MutationCallbacks<ProjectDetailVM>
  ) => {
    setCreateMutation({ isLoading: true, error: null });

    try {
      const result = await projectRepo.createProject(dto);

      if (!result.success) {
        setCreateMutation({ isLoading: false, error: result.error.message });
        callbacks?.onError?.(result.error.message);
        return;
      }

      // Vytvoříme stoly pro grid
      const { rows, columns } = dto.gridConfig;
      const tableDtos: CreateTableDto[] = [];

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          tableDtos.push({
            projectId: result.data.id,
            position: { row, column },
            size: 'large',
          });
        }
      }

      await tableRepo.createTables(tableDtos);

      const detail = mapProjectToDetail(result.data);
      setCreateMutation({ isLoading: false, error: null });
      callbacks?.onSuccess?.(detail);

      // Refresh seznamu
      await loadProjects();
    } catch (error) {
      const message = String(error);
      setCreateMutation({ isLoading: false, error: message });
      callbacks?.onError?.(message);
    }
  }, [projectRepo, tableRepo, loadProjects]);

  /**
   * Aktualizuje projekt
   */
  const updateProject = useCallback(async (
    projectId: string,
    dto: UpdateProjectDto,
    callbacks?: MutationCallbacks<ProjectDetailVM>
  ) => {
    setUpdateMutation({ isLoading: true, error: null });

    try {
      const result = await projectRepo.updateProject(projectId, dto);

      if (!result.success) {
        setUpdateMutation({ isLoading: false, error: result.error.message });
        callbacks?.onError?.(result.error.message);
        return;
      }

      const stats = await loadProjectStatistics(projectId);
      const detail = mapProjectToDetail(result.data, stats ?? undefined);

      setUpdateMutation({ isLoading: false, error: null });
      setActiveProject(successState(detail));
      callbacks?.onSuccess?.(detail);

      // Refresh seznamu
      await loadProjects();
    } catch (error) {
      const message = String(error);
      setUpdateMutation({ isLoading: false, error: message });
      callbacks?.onError?.(message);
    }
  }, [projectRepo, loadProjectStatistics, loadProjects]);

  /**
   * Smaže projekt
   */
  const deleteProject = useCallback(async (
    projectId: string,
    callbacks?: MutationCallbacks<void>
  ) => {
    setDeleteMutation({ isLoading: true, error: null });

    try {
      const result = await projectRepo.deleteProjectWithRelated(projectId);

      if (!result.success) {
        setDeleteMutation({ isLoading: false, error: result.error.message });
        callbacks?.onError?.(result.error.message);
        return;
      }

      setDeleteMutation({ isLoading: false, error: null });
      setActiveProject(successState(null));
      callbacks?.onSuccess?.(undefined);

      // Refresh seznamu
      await loadProjects();
    } catch (error) {
      const message = String(error);
      setDeleteMutation({ isLoading: false, error: message });
      callbacks?.onError?.(message);
    }
  }, [projectRepo, loadProjects]);

  /**
   * Refresh
   */
  const refresh = useCallback(async () => {
    await loadProjects();
    if (activeProject.data) {
      await loadProjectDetail(activeProject.data.id);
    }
  }, [loadProjects, loadProjectDetail, activeProject.data]);

  return {
    projects,
    activeProject,
    createMutation,
    updateMutation,
    deleteMutation,
    loadProjects,
    loadProjectDetail,
    createProject,
    updateProject,
    deleteProject,
    refresh,
  };
}
