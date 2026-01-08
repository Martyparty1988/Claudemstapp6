/**
 * MST Domain Validation - Project
 * 
 * Validační pravidla pro projekty.
 */

import { PROJECT_STATUS, type ProjectStatus } from '../types';
import type {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectGridConfig,
  Result,
} from '../types';
import { success, failure } from '../types';

/**
 * Typy validačních chyb pro projekt
 */
export type ProjectValidationError =
  | { code: 'INVALID_NAME'; message: string }
  | { code: 'INVALID_DESCRIPTION'; message: string }
  | { code: 'INVALID_LOCATION'; message: string }
  | { code: 'INVALID_STATUS'; message: string }
  | { code: 'INVALID_GRID_CONFIG'; message: string };

/**
 * Limity pro projekt
 */
const PROJECT_LIMITS = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  LOCATION_MAX_LENGTH: 200,
  GRID_MIN_SIZE: 1,
  GRID_MAX_ROWS: 100,
  GRID_MAX_COLUMNS: 100,
} as const;

/**
 * Validní statusy projektu
 */
const VALID_PROJECT_STATUSES = Object.values(PROJECT_STATUS);

/**
 * Validuje název projektu
 */
export function validateProjectName(
  name: unknown
): Result<string, ProjectValidationError> {
  if (typeof name !== 'string') {
    return failure({
      code: 'INVALID_NAME',
      message: 'Project name must be a string',
    });
  }

  const trimmed = name.trim();

  if (trimmed.length < PROJECT_LIMITS.NAME_MIN_LENGTH) {
    return failure({
      code: 'INVALID_NAME',
      message: 'Project name is required',
    });
  }

  if (trimmed.length > PROJECT_LIMITS.NAME_MAX_LENGTH) {
    return failure({
      code: 'INVALID_NAME',
      message: `Project name must be ${PROJECT_LIMITS.NAME_MAX_LENGTH} characters or less`,
    });
  }

  return success(trimmed);
}

/**
 * Validuje popis projektu
 */
export function validateProjectDescription(
  description: unknown
): Result<string | undefined, ProjectValidationError> {
  if (description === undefined || description === null) {
    return success(undefined);
  }

  if (typeof description !== 'string') {
    return failure({
      code: 'INVALID_DESCRIPTION',
      message: 'Description must be a string',
    });
  }

  const trimmed = description.trim();

  if (trimmed.length > PROJECT_LIMITS.DESCRIPTION_MAX_LENGTH) {
    return failure({
      code: 'INVALID_DESCRIPTION',
      message: `Description must be ${PROJECT_LIMITS.DESCRIPTION_MAX_LENGTH} characters or less`,
    });
  }

  return success(trimmed || undefined);
}

/**
 * Validuje lokaci projektu
 */
export function validateProjectLocation(
  location: unknown
): Result<string | undefined, ProjectValidationError> {
  if (location === undefined || location === null) {
    return success(undefined);
  }

  if (typeof location !== 'string') {
    return failure({
      code: 'INVALID_LOCATION',
      message: 'Location must be a string',
    });
  }

  const trimmed = location.trim();

  if (trimmed.length > PROJECT_LIMITS.LOCATION_MAX_LENGTH) {
    return failure({
      code: 'INVALID_LOCATION',
      message: `Location must be ${PROJECT_LIMITS.LOCATION_MAX_LENGTH} characters or less`,
    });
  }

  return success(trimmed || undefined);
}

/**
 * Validuje status projektu
 */
export function validateProjectStatus(
  status: unknown
): Result<ProjectStatus, ProjectValidationError> {
  if (typeof status !== 'string') {
    return failure({
      code: 'INVALID_STATUS',
      message: 'Status must be a string',
    });
  }

  if (!VALID_PROJECT_STATUSES.includes(status as ProjectStatus)) {
    return failure({
      code: 'INVALID_STATUS',
      message: `Invalid status: ${status}. Valid statuses: ${VALID_PROJECT_STATUSES.join(', ')}`,
    });
  }

  return success(status as ProjectStatus);
}

/**
 * Validuje konfiguraci gridu
 */
export function validateGridConfig(
  config: unknown
): Result<ProjectGridConfig, ProjectValidationError> {
  if (typeof config !== 'object' || config === null) {
    return failure({
      code: 'INVALID_GRID_CONFIG',
      message: 'Grid config must be an object with rows and columns',
    });
  }

  const { rows, columns } = config as ProjectGridConfig;

  if (
    typeof rows !== 'number' ||
    typeof columns !== 'number' ||
    !Number.isInteger(rows) ||
    !Number.isInteger(columns)
  ) {
    return failure({
      code: 'INVALID_GRID_CONFIG',
      message: 'Rows and columns must be integers',
    });
  }

  if (rows < PROJECT_LIMITS.GRID_MIN_SIZE || columns < PROJECT_LIMITS.GRID_MIN_SIZE) {
    return failure({
      code: 'INVALID_GRID_CONFIG',
      message: `Grid must be at least ${PROJECT_LIMITS.GRID_MIN_SIZE}x${PROJECT_LIMITS.GRID_MIN_SIZE}`,
    });
  }

  if (rows > PROJECT_LIMITS.GRID_MAX_ROWS) {
    return failure({
      code: 'INVALID_GRID_CONFIG',
      message: `Grid cannot have more than ${PROJECT_LIMITS.GRID_MAX_ROWS} rows`,
    });
  }

  if (columns > PROJECT_LIMITS.GRID_MAX_COLUMNS) {
    return failure({
      code: 'INVALID_GRID_CONFIG',
      message: `Grid cannot have more than ${PROJECT_LIMITS.GRID_MAX_COLUMNS} columns`,
    });
  }

  return success({ rows, columns });
}

/**
 * Validuje DTO pro vytvoření projektu
 */
export function validateCreateProjectDto(
  dto: unknown
): Result<CreateProjectDto, ProjectValidationError> {
  if (typeof dto !== 'object' || dto === null) {
    return failure({
      code: 'INVALID_NAME',
      message: 'Invalid input',
    });
  }

  const input = dto as Record<string, unknown>;

  // Validate name
  const nameResult = validateProjectName(input.name);
  if (!nameResult.success) {
    return nameResult;
  }

  // Validate description
  const descriptionResult = validateProjectDescription(input.description);
  if (!descriptionResult.success) {
    return descriptionResult;
  }

  // Validate location
  const locationResult = validateProjectLocation(input.location);
  if (!locationResult.success) {
    return locationResult;
  }

  // Validate grid config
  const gridResult = validateGridConfig(input.gridConfig);
  if (!gridResult.success) {
    return gridResult;
  }

  return success({
    name: nameResult.data,
    description: descriptionResult.data,
    location: locationResult.data,
    gridConfig: gridResult.data,
  });
}

/**
 * Validuje DTO pro update projektu
 */
export function validateUpdateProjectDto(
  dto: unknown
): Result<UpdateProjectDto, ProjectValidationError> {
  if (typeof dto !== 'object' || dto === null) {
    return failure({
      code: 'INVALID_NAME',
      message: 'Invalid input',
    });
  }

  const input = dto as Record<string, unknown>;
  const result: UpdateProjectDto = {};

  // Validate name if provided
  if (input.name !== undefined) {
    const nameResult = validateProjectName(input.name);
    if (!nameResult.success) {
      return nameResult;
    }
    (result as { name?: string }).name = nameResult.data;
  }

  // Validate description if provided
  if (input.description !== undefined) {
    const descriptionResult = validateProjectDescription(input.description);
    if (!descriptionResult.success) {
      return descriptionResult;
    }
    (result as { description?: string }).description = descriptionResult.data;
  }

  // Validate location if provided
  if (input.location !== undefined) {
    const locationResult = validateProjectLocation(input.location);
    if (!locationResult.success) {
      return locationResult;
    }
    (result as { location?: string }).location = locationResult.data;
  }

  // Validate status if provided
  if (input.status !== undefined) {
    const statusResult = validateProjectStatus(input.status);
    if (!statusResult.success) {
      return statusResult;
    }
    (result as { status?: ProjectStatus }).status = statusResult.data;
  }

  // Validate grid config if provided
  if (input.gridConfig !== undefined) {
    const gridResult = validateGridConfig(input.gridConfig);
    if (!gridResult.success) {
      return gridResult;
    }
    (result as { gridConfig?: ProjectGridConfig }).gridConfig = gridResult.data;
  }

  return success(result);
}
