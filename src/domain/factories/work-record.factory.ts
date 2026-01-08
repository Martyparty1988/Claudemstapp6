/**
 * MST Domain Factories - Work Record
 * 
 * Factory funkce pro vytváření work record entit.
 */

import type {
  WorkRecord,
  CreateWorkRecordDto,
  IdGenerator,
  Result,
} from '../types';
import { WORK_STATUS } from '../constants';
import { validateCreateWorkRecordDto, type WorkRecordValidationError } from '../validation';
import { success } from '../types';

/**
 * Výchozí ID generátor
 */
const defaultIdGenerator: IdGenerator = () =>
  `work_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Vytvoří nový work record
 */
export function createWorkRecord(
  dto: CreateWorkRecordDto,
  idGenerator: IdGenerator = defaultIdGenerator
): WorkRecord {
  const now = Date.now();

  return {
    id: idGenerator(),
    projectId: dto.projectId,
    tableIds: dto.tableIds,
    workType: dto.workType,
    status: dto.status,
    notes: dto.notes,
    workerName: dto.workerName,
    startedAt: now,
    completedAt: dto.status === WORK_STATUS.completed ? now : undefined,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Vytvoří work record s validací
 */
export function createWorkRecordWithValidation(
  input: unknown,
  idGenerator: IdGenerator = defaultIdGenerator
): Result<WorkRecord, WorkRecordValidationError> {
  const validationResult = validateCreateWorkRecordDto(input);

  if (!validationResult.success) {
    return validationResult;
  }

  return success(createWorkRecord(validationResult.data, idGenerator));
}

/**
 * Dokončí work record
 */
export function completeWorkRecord(record: WorkRecord): WorkRecord {
  if (record.status === WORK_STATUS.completed) {
    return record;
  }

  return {
    ...record,
    status: WORK_STATUS.completed,
    completedAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Updatuje work record
 */
export function updateWorkRecord(
  record: WorkRecord,
  updates: Partial<Pick<WorkRecord, 'status' | 'notes' | 'completedAt'>>
): WorkRecord {
  const updatedRecord: WorkRecord = {
    ...record,
    ...updates,
    updatedAt: Date.now(),
  };

  // Auto-set completedAt pokud se status mění na completed
  if (updates.status === WORK_STATUS.completed && !updatedRecord.completedAt) {
    return {
      ...updatedRecord,
      completedAt: Date.now(),
    };
  }

  return updatedRecord;
}

/**
 * Přidá poznámku k work recordu
 */
export function addNoteToWorkRecord(record: WorkRecord, note: string): WorkRecord {
  const existingNotes = record.notes || '';
  const newNotes = existingNotes
    ? `${existingNotes}\n---\n${note}`
    : note;

  return {
    ...record,
    notes: newNotes,
    updatedAt: Date.now(),
  };
}
