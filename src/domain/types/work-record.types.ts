/**
 * MST Domain Types - Work Record
 * 
 * Definice typů pro záznamy práce.
 * Work Record je vytvořen po potvrzení v bottom-sheetu.
 */

import type { WorkStatus } from '../constants';

/**
 * Typ pracovní činnosti
 */
export const WORK_TYPE = {
  installation: 'installation',
  inspection: 'inspection',
  maintenance: 'maintenance',
  repair: 'repair',
} as const;

export type WorkType = (typeof WORK_TYPE)[keyof typeof WORK_TYPE];

/**
 * Základní entita pracovního záznamu
 */
export interface WorkRecord {
  readonly id: string;
  readonly projectId: string;
  readonly tableIds: readonly string[];
  readonly workType: WorkType;
  readonly status: WorkStatus;
  readonly notes?: string;
  readonly workerName?: string;
  readonly startedAt: number;
  readonly completedAt?: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}

/**
 * Sumarizace práce za den
 */
export interface DailyWorkSummary {
  readonly date: string; // ISO date string YYYY-MM-DD
  readonly projectId: string;
  readonly totalRecords: number;
  readonly completedTables: number;
  readonly totalStrings: number;
  readonly totalPanels: number;
  readonly totalKwp: number;
}

/**
 * DTO pro vytvoření pracovního záznamu
 */
export interface CreateWorkRecordDto {
  readonly projectId: string;
  readonly tableIds: readonly string[];
  readonly workType: WorkType;
  readonly status: WorkStatus;
  readonly notes?: string;
  readonly workerName?: string;
}

/**
 * DTO pro update pracovního záznamu
 */
export interface UpdateWorkRecordDto {
  readonly status?: WorkStatus;
  readonly notes?: string;
  readonly completedAt?: number;
}
