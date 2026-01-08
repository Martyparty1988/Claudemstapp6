/**
 * MST Domain Validation - Work Record
 * 
 * Validační pravidla pro pracovní záznamy.
 */

import { WORK_STATUS, type WorkStatus } from '../constants';
import { WORK_TYPE, type WorkType } from '../types';
import type { CreateWorkRecordDto, UpdateWorkRecordDto, Result } from '../types';
import { success, failure } from '../types';

/**
 * Typy validačních chyb pro work record
 */
export type WorkRecordValidationError =
  | { code: 'MISSING_PROJECT_ID'; message: string }
  | { code: 'INVALID_TABLE_IDS'; message: string }
  | { code: 'INVALID_WORK_TYPE'; message: string }
  | { code: 'INVALID_STATUS'; message: string }
  | { code: 'INVALID_NOTES'; message: string }
  | { code: 'INVALID_WORKER_NAME'; message: string }
  | { code: 'INVALID_TIMESTAMP'; message: string };

/**
 * Limity
 */
const WORK_RECORD_LIMITS = {
  NOTES_MAX_LENGTH: 1000,
  WORKER_NAME_MAX_LENGTH: 100,
  MIN_TABLE_IDS: 1,
  MAX_TABLE_IDS: 100,
} as const;

/**
 * Validní hodnoty
 */
const VALID_WORK_STATUSES = Object.values(WORK_STATUS);
const VALID_WORK_TYPES = Object.values(WORK_TYPE);

/**
 * Validuje table IDs
 */
export function validateTableIds(
  tableIds: unknown
): Result<readonly string[], WorkRecordValidationError> {
  if (!Array.isArray(tableIds)) {
    return failure({
      code: 'INVALID_TABLE_IDS',
      message: 'Table IDs must be an array',
    });
  }

  if (tableIds.length < WORK_RECORD_LIMITS.MIN_TABLE_IDS) {
    return failure({
      code: 'INVALID_TABLE_IDS',
      message: 'At least one table must be selected',
    });
  }

  if (tableIds.length > WORK_RECORD_LIMITS.MAX_TABLE_IDS) {
    return failure({
      code: 'INVALID_TABLE_IDS',
      message: `Cannot select more than ${WORK_RECORD_LIMITS.MAX_TABLE_IDS} tables at once`,
    });
  }

  for (const id of tableIds) {
    if (typeof id !== 'string' || !id.trim()) {
      return failure({
        code: 'INVALID_TABLE_IDS',
        message: 'All table IDs must be non-empty strings',
      });
    }
  }

  return success(tableIds.map((id) => id.trim()));
}

/**
 * Validuje work type
 */
export function validateWorkType(
  workType: unknown
): Result<WorkType, WorkRecordValidationError> {
  if (typeof workType !== 'string') {
    return failure({
      code: 'INVALID_WORK_TYPE',
      message: 'Work type must be a string',
    });
  }

  if (!VALID_WORK_TYPES.includes(workType as WorkType)) {
    return failure({
      code: 'INVALID_WORK_TYPE',
      message: `Invalid work type: ${workType}. Valid types: ${VALID_WORK_TYPES.join(', ')}`,
    });
  }

  return success(workType as WorkType);
}

/**
 * Validuje work status
 */
export function validateWorkStatus(
  status: unknown
): Result<WorkStatus, WorkRecordValidationError> {
  if (typeof status !== 'string') {
    return failure({
      code: 'INVALID_STATUS',
      message: 'Status must be a string',
    });
  }

  if (!VALID_WORK_STATUSES.includes(status as WorkStatus)) {
    return failure({
      code: 'INVALID_STATUS',
      message: `Invalid status: ${status}. Valid statuses: ${VALID_WORK_STATUSES.join(', ')}`,
    });
  }

  return success(status as WorkStatus);
}

/**
 * Validuje poznámky
 */
export function validateNotes(
  notes: unknown
): Result<string | undefined, WorkRecordValidationError> {
  if (notes === undefined || notes === null) {
    return success(undefined);
  }

  if (typeof notes !== 'string') {
    return failure({
      code: 'INVALID_NOTES',
      message: 'Notes must be a string',
    });
  }

  const trimmed = notes.trim();

  if (trimmed.length > WORK_RECORD_LIMITS.NOTES_MAX_LENGTH) {
    return failure({
      code: 'INVALID_NOTES',
      message: `Notes must be ${WORK_RECORD_LIMITS.NOTES_MAX_LENGTH} characters or less`,
    });
  }

  return success(trimmed || undefined);
}

/**
 * Validuje jméno pracovníka
 */
export function validateWorkerName(
  workerName: unknown
): Result<string | undefined, WorkRecordValidationError> {
  if (workerName === undefined || workerName === null) {
    return success(undefined);
  }

  if (typeof workerName !== 'string') {
    return failure({
      code: 'INVALID_WORKER_NAME',
      message: 'Worker name must be a string',
    });
  }

  const trimmed = workerName.trim();

  if (trimmed.length > WORK_RECORD_LIMITS.WORKER_NAME_MAX_LENGTH) {
    return failure({
      code: 'INVALID_WORKER_NAME',
      message: `Worker name must be ${WORK_RECORD_LIMITS.WORKER_NAME_MAX_LENGTH} characters or less`,
    });
  }

  return success(trimmed || undefined);
}

/**
 * Validuje timestamp
 */
export function validateTimestamp(
  timestamp: unknown
): Result<number, WorkRecordValidationError> {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    return failure({
      code: 'INVALID_TIMESTAMP',
      message: 'Timestamp must be a valid number',
    });
  }

  if (timestamp < 0) {
    return failure({
      code: 'INVALID_TIMESTAMP',
      message: 'Timestamp cannot be negative',
    });
  }

  return success(timestamp);
}

/**
 * Validuje DTO pro vytvoření work recordu
 */
export function validateCreateWorkRecordDto(
  dto: unknown
): Result<CreateWorkRecordDto, WorkRecordValidationError> {
  if (typeof dto !== 'object' || dto === null) {
    return failure({
      code: 'MISSING_PROJECT_ID',
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

  // Validate tableIds
  const tableIdsResult = validateTableIds(input.tableIds);
  if (!tableIdsResult.success) {
    return tableIdsResult;
  }

  // Validate workType
  const workTypeResult = validateWorkType(input.workType);
  if (!workTypeResult.success) {
    return workTypeResult;
  }

  // Validate status
  const statusResult = validateWorkStatus(input.status);
  if (!statusResult.success) {
    return statusResult;
  }

  // Validate notes
  const notesResult = validateNotes(input.notes);
  if (!notesResult.success) {
    return notesResult;
  }

  // Validate workerName
  const workerNameResult = validateWorkerName(input.workerName);
  if (!workerNameResult.success) {
    return workerNameResult;
  }

  return success({
    projectId: input.projectId.trim(),
    tableIds: tableIdsResult.data,
    workType: workTypeResult.data,
    status: statusResult.data,
    notes: notesResult.data,
    workerName: workerNameResult.data,
  });
}

/**
 * Validuje DTO pro update work recordu
 */
export function validateUpdateWorkRecordDto(
  dto: unknown
): Result<UpdateWorkRecordDto, WorkRecordValidationError> {
  if (typeof dto !== 'object' || dto === null) {
    return failure({
      code: 'MISSING_PROJECT_ID',
      message: 'Invalid input',
    });
  }

  const input = dto as Record<string, unknown>;
  const result: UpdateWorkRecordDto = {};

  // Validate status if provided
  if (input.status !== undefined) {
    const statusResult = validateWorkStatus(input.status);
    if (!statusResult.success) {
      return statusResult;
    }
    (result as { status?: WorkStatus }).status = statusResult.data;
  }

  // Validate notes if provided
  if (input.notes !== undefined) {
    const notesResult = validateNotes(input.notes);
    if (!notesResult.success) {
      return notesResult;
    }
    (result as { notes?: string }).notes = notesResult.data;
  }

  // Validate completedAt if provided
  if (input.completedAt !== undefined) {
    if (input.completedAt === null) {
      (result as { completedAt?: number }).completedAt = undefined;
    } else {
      const timestampResult = validateTimestamp(input.completedAt);
      if (!timestampResult.success) {
        return timestampResult;
      }
      (result as { completedAt?: number }).completedAt = timestampResult.data;
    }
  }

  return success(result);
}
