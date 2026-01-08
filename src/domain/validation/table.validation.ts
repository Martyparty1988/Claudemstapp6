/**
 * MST Domain Validation - Table
 * 
 * Validační pravidla pro stoly.
 * Čistá business logika bez side effects.
 */

import { VALID_TABLE_SIZES, type TableSize } from '../constants';
import type {
  CreateTableDto,
  UpdateTableDto,
  TablePosition,
  ProjectGridConfig,
  Result,
} from '../types';
import { success, failure } from '../types';

/**
 * Typy validačních chyb
 */
export type TableValidationError =
  | { code: 'INVALID_SIZE'; message: string }
  | { code: 'INVALID_POSITION'; message: string }
  | { code: 'POSITION_OUT_OF_BOUNDS'; message: string }
  | { code: 'MISSING_PROJECT_ID'; message: string }
  | { code: 'INVALID_LABEL'; message: string };

/**
 * Validuje velikost stolu
 */
export function validateTableSize(
  size: unknown
): Result<TableSize, TableValidationError> {
  if (typeof size !== 'string') {
    return failure({
      code: 'INVALID_SIZE',
      message: 'Table size must be a string',
    });
  }

  if (!VALID_TABLE_SIZES.includes(size as TableSize)) {
    return failure({
      code: 'INVALID_SIZE',
      message: `Invalid table size: ${size}. Valid sizes: ${VALID_TABLE_SIZES.join(', ')}`,
    });
  }

  return success(size as TableSize);
}

/**
 * Validuje pozici stolu
 */
export function validateTablePosition(
  position: unknown
): Result<TablePosition, TableValidationError> {
  if (
    typeof position !== 'object' ||
    position === null ||
    typeof (position as TablePosition).row !== 'number' ||
    typeof (position as TablePosition).column !== 'number'
  ) {
    return failure({
      code: 'INVALID_POSITION',
      message: 'Position must have numeric row and column',
    });
  }

  const { row, column } = position as TablePosition;

  if (row < 0 || column < 0 || !Number.isInteger(row) || !Number.isInteger(column)) {
    return failure({
      code: 'INVALID_POSITION',
      message: 'Row and column must be non-negative integers',
    });
  }

  return success({ row, column });
}

/**
 * Validuje, zda je pozice v rámci gridu
 */
export function validatePositionInGrid(
  position: TablePosition,
  gridConfig: ProjectGridConfig
): Result<TablePosition, TableValidationError> {
  if (position.row >= gridConfig.rows || position.column >= gridConfig.columns) {
    return failure({
      code: 'POSITION_OUT_OF_BOUNDS',
      message: `Position (${position.row}, ${position.column}) is outside grid (${gridConfig.rows}x${gridConfig.columns})`,
    });
  }

  return success(position);
}

/**
 * Validuje label stolu
 */
export function validateTableLabel(
  label: unknown
): Result<string | undefined, TableValidationError> {
  if (label === undefined || label === null) {
    return success(undefined);
  }

  if (typeof label !== 'string') {
    return failure({
      code: 'INVALID_LABEL',
      message: 'Label must be a string',
    });
  }

  const trimmed = label.trim();
  if (trimmed.length > 50) {
    return failure({
      code: 'INVALID_LABEL',
      message: 'Label must be 50 characters or less',
    });
  }

  return success(trimmed || undefined);
}

/**
 * Validuje DTO pro vytvoření stolu
 */
export function validateCreateTableDto(
  dto: unknown
): Result<CreateTableDto, TableValidationError> {
  if (typeof dto !== 'object' || dto === null) {
    return failure({
      code: 'INVALID_POSITION',
      message: 'Invalid input',
    });
  }

  const input = dto as Record<string, unknown>;

  // Validate projectId
  if (typeof input.projectId !== 'string' || !input.projectId.trim()) {
    return failure({
      code: 'MISSING_PROJECT_ID',
      message: 'Project ID is required',
    });
  }

  // Validate position
  const positionResult = validateTablePosition(input.position);
  if (!positionResult.success) {
    return positionResult;
  }

  // Validate size
  const sizeResult = validateTableSize(input.size);
  if (!sizeResult.success) {
    return sizeResult;
  }

  // Validate label
  const labelResult = validateTableLabel(input.label);
  if (!labelResult.success) {
    return labelResult;
  }

  return success({
    projectId: input.projectId.trim(),
    position: positionResult.data,
    size: sizeResult.data,
    label: labelResult.data,
  });
}

/**
 * Validuje DTO pro update stolu
 */
export function validateUpdateTableDto(
  dto: unknown
): Result<UpdateTableDto, TableValidationError> {
  if (typeof dto !== 'object' || dto === null) {
    return failure({
      code: 'INVALID_POSITION',
      message: 'Invalid input',
    });
  }

  const input = dto as Record<string, unknown>;
  const result: UpdateTableDto = {};

  // Validate size if provided
  if (input.size !== undefined) {
    const sizeResult = validateTableSize(input.size);
    if (!sizeResult.success) {
      return sizeResult;
    }
    (result as { size?: TableSize }).size = sizeResult.data;
  }

  // Validate label if provided
  if (input.label !== undefined) {
    const labelResult = validateTableLabel(input.label);
    if (!labelResult.success) {
      return labelResult;
    }
    (result as { label?: string }).label = labelResult.data;
  }

  return success(result);
}
