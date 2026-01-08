/**
 * MST Domain Constants - Work Status
 * 
 * Definuje stavy práce na stolech.
 */

export const WORK_STATUS = {
  pending: 'pending',
  inProgress: 'in_progress',
  completed: 'completed',
  skipped: 'skipped',
} as const;

export type WorkStatus = (typeof WORK_STATUS)[keyof typeof WORK_STATUS];

/**
 * Mapování statusů na UI barvy (pouze identifikátory, ne CSS)
 */
export const WORK_STATUS_IDENTIFIERS = {
  [WORK_STATUS.pending]: 'status-pending',
  [WORK_STATUS.inProgress]: 'status-in-progress',
  [WORK_STATUS.completed]: 'status-completed',
  [WORK_STATUS.skipped]: 'status-skipped',
} as const;

/**
 * Priorita statusů pro řazení
 */
export const WORK_STATUS_PRIORITY: Record<WorkStatus, number> = {
  [WORK_STATUS.inProgress]: 1,
  [WORK_STATUS.pending]: 2,
  [WORK_STATUS.completed]: 3,
  [WORK_STATUS.skipped]: 4,
};
