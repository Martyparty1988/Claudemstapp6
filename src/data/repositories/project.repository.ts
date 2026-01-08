/**
 * MST Project Repository
 * 
 * Data access layer pro projekty.
 * Jediný přístupový bod k project datům v databázi.
 */

import { getDatabase } from '../database';
import {
  BaseRepository,
  type RepositoryError,
  type ListOptions,
  databaseError,
} from './base.repository';
import type {
  Project,
  ProjectStatus,
  CreateProjectDto,
  UpdateProjectDto,
  Result,
  PaginatedResult,
} from '../../domain';
import {
  createProject,
  updateProject as domainUpdateProject,
  validateCreateProjectDto,
  validateUpdateProjectDto,
  success,
  failure,
} from '../../domain';

/**
 * Options pro filtrování projektů
 */
export interface ProjectListOptions extends ListOptions {
  readonly status?: ProjectStatus;
}

/**
 * Project Repository
 */
class ProjectRepositoryImpl extends BaseRepository<Project> {
  constructor() {
    super(getDatabase().projects, 'Project');
  }

  /**
   * Vytvoří nový projekt s validací
   */
  async createProject(
    dto: CreateProjectDto
  ): Promise<Result<Project, RepositoryError>> {
    // Validace
    const validationResult = validateCreateProjectDto(dto);
    if (!validationResult.success) {
      return failure({
        code: 'VALIDATION_ERROR',
        message: validationResult.error.message,
      });
    }

    // Vytvoření entity
    const project = createProject(validationResult.data);

    // Uložení
    return this.create(project);
  }

  /**
   * Aktualizuje projekt s validací
   */
  async updateProject(
    id: string,
    dto: UpdateProjectDto
  ): Promise<Result<Project, RepositoryError>> {
    // Validace
    const validationResult = validateUpdateProjectDto(dto);
    if (!validationResult.success) {
      return failure({
        code: 'VALIDATION_ERROR',
        message: validationResult.error.message,
      });
    }

    // Získání existujícího
    const existingResult = await this.getById(id);
    if (!existingResult.success) {
      return existingResult;
    }

    // Update přes domain funkci
    const updated = domainUpdateProject(existingResult.data, validationResult.data);

    // Uložení
    try {
      await this.table.put(updated);
      return success(updated);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá projekty podle statusu
   */
  async getByStatus(
    status: ProjectStatus
  ): Promise<Result<readonly Project[], RepositoryError>> {
    try {
      const projects = await this.table
        .where('status')
        .equals(status)
        .toArray();

      return success(projects);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá projekty s filtrováním a paginací
   */
  async listProjects(
    options: ProjectListOptions = {}
  ): Promise<Result<PaginatedResult<Project>, RepositoryError>> {
    try {
      const { status, ...listOptions } = options;

      // Pokud je status filter, použijeme ho
      if (status) {
        const filtered = await this.table
          .where('status')
          .equals(status)
          .toArray();

        const offset = listOptions.offset ?? 0;
        const limit = listOptions.limit ?? 50;

        const items = filtered.slice(offset, offset + limit);

        return success({
          items,
          total: filtered.length,
          page: Math.floor(offset / limit) + 1,
          pageSize: limit,
          hasMore: offset + items.length < filtered.length,
        });
      }

      // Jinak použijeme base list
      return this.list(listOptions);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Získá aktivní projekty
   */
  async getActiveProjects(): Promise<Result<readonly Project[], RepositoryError>> {
    return this.getByStatus('active');
  }

  /**
   * Vyhledá projekty podle názvu
   */
  async searchByName(
    query: string
  ): Promise<Result<readonly Project[], RepositoryError>> {
    try {
      const lowerQuery = query.toLowerCase();

      const projects = await this.table
        .filter((project) => project.name.toLowerCase().includes(lowerQuery))
        .toArray();

      return success(projects);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }

  /**
   * Smaže projekt a všechna související data
   */
  async deleteProjectWithRelated(
    id: string
  ): Promise<Result<void, RepositoryError>> {
    try {
      const db = getDatabase();

      // Transakce pro konzistenci
      await db.transaction(
        'rw',
        [db.projects, db.solarTables, db.tableWorkStates, db.workRecords],
        async () => {
          // Získáme všechny stoly projektu
          const tables = await db.solarTables
            .where('projectId')
            .equals(id)
            .toArray();

          const tableIds = tables.map((t) => t.id);

          // Smažeme work states
          await db.tableWorkStates.bulkDelete(tableIds);

          // Smažeme stoly
          await db.solarTables.where('projectId').equals(id).delete();

          // Smažeme work records
          await db.workRecords.where('projectId').equals(id).delete();

          // Smažeme projekt
          await db.projects.delete(id);
        }
      );

      return success(undefined);
    } catch (error) {
      return failure(databaseError(String(error)));
    }
  }
}

/**
 * Singleton instance
 */
let instance: ProjectRepositoryImpl | null = null;

/**
 * Získá instanci Project repository
 */
export function getProjectRepository(): ProjectRepositoryImpl {
  if (!instance) {
    instance = new ProjectRepositoryImpl();
  }
  return instance;
}

/**
 * Export typu pro dependency injection
 */
export type ProjectRepository = ProjectRepositoryImpl;
