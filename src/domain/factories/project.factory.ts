/**
 * MST Domain Factories - Project
 * 
 * Factory funkce pro vytváření project entit.
 */

import type {
  Project,
  ProjectWithStatistics,
  CreateProjectDto,
  IdGenerator,
  Result,
} from '../types';
import { PROJECT_STATUS } from '../types';
import { validateCreateProjectDto, type ProjectValidationError } from '../validation';
import { createEmptyStatistics } from '../calculations';
import { success } from '../types';

/**
 * Výchozí ID generátor
 */
const defaultIdGenerator: IdGenerator = () =>
  `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Vytvoří nový projekt
 */
export function createProject(
  dto: CreateProjectDto,
  idGenerator: IdGenerator = defaultIdGenerator
): Project {
  const now = Date.now();

  return {
    id: idGenerator(),
    name: dto.name,
    description: dto.description,
    location: dto.location,
    status: PROJECT_STATUS.draft,
    gridConfig: dto.gridConfig,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Vytvoří projekt s validací
 */
export function createProjectWithValidation(
  input: unknown,
  idGenerator: IdGenerator = defaultIdGenerator
): Result<Project, ProjectValidationError> {
  const validationResult = validateCreateProjectDto(input);

  if (!validationResult.success) {
    return validationResult;
  }

  return success(createProject(validationResult.data, idGenerator));
}

/**
 * Vytvoří projekt s prázdnými statistikami
 */
export function createProjectWithEmptyStatistics(
  dto: CreateProjectDto,
  idGenerator: IdGenerator = defaultIdGenerator
): ProjectWithStatistics {
  const project = createProject(dto, idGenerator);

  return {
    ...project,
    statistics: createEmptyStatistics(),
  };
}

/**
 * Aktivuje projekt (změní status z draft na active)
 */
export function activateProject(project: Project): Project {
  if (project.status !== PROJECT_STATUS.draft) {
    return project;
  }

  return {
    ...project,
    status: PROJECT_STATUS.active,
    updatedAt: Date.now(),
  };
}

/**
 * Dokončí projekt
 */
export function completeProject(project: Project): Project {
  if (project.status === PROJECT_STATUS.archived) {
    return project;
  }

  return {
    ...project,
    status: PROJECT_STATUS.completed,
    updatedAt: Date.now(),
  };
}

/**
 * Archivuje projekt
 */
export function archiveProject(project: Project): Project {
  return {
    ...project,
    status: PROJECT_STATUS.archived,
    updatedAt: Date.now(),
  };
}

/**
 * Updatuje projekt
 */
export function updateProject(
  project: Project,
  updates: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>
): Project {
  return {
    ...project,
    ...updates,
    updatedAt: Date.now(),
  };
}
