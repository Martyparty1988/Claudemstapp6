/**
 * MST Domain Layer - Public API
 * 
 * Tento modul exportuje veškerou business logiku aplikace.
 * 
 * PRAVIDLA:
 * - Žádné React importy
 * - Žádné side effects
 * - Čisté funkce
 * - Immutable data
 * 
 * STRUKTURA:
 * - constants: Business konstanty (velikosti stolů, statusy, limity)
 * - types: TypeScript definice entit a DTO
 * - calculations: Čisté výpočetní funkce
 * - validation: Validační pravidla
 * - factories: Factory funkce pro vytváření entit
 */

// Constants
export * from './constants';

// Types
export * from './types';

// Calculations
export {
  // Table calculations
  calculateStringsForSize,
  calculatePanelsFromStrings,
  calculateKwpFromPanels,
  calculateTableValues,
  enrichTableWithCalculations,
  enrichTablesWithCalculations,
  sumTableValues,
  formatKwp,
  // Project statistics
  calculateProjectStatistics,
  enrichProjectWithStatistics,
  createEmptyStatistics,
  calculateStatisticsDiff,
  // Work record calculations
  groupWorkRecordsByDate,
  formatDateKey,
  calculateDailyWorkSummary,
  filterRecordsByTimeRange,
  calculateAverageDailyProductivity,
  sortRecordsByDate,
} from './calculations';

// Validation
export {
  // Table validation
  validateTableSize,
  validateTablePosition,
  validatePositionInGrid,
  validateTableLabel,
  validateCreateTableDto,
  validateUpdateTableDto,
  type TableValidationError,
  // Project validation
  validateProjectName,
  validateProjectDescription,
  validateProjectLocation,
  validateProjectStatus,
  validateGridConfig,
  validateCreateProjectDto,
  validateUpdateProjectDto,
  type ProjectValidationError,
  // Work record validation
  validateTableIds,
  validateWorkType,
  validateWorkStatus,
  validateNotes,
  validateWorkerName,
  validateTimestamp,
  validateCreateWorkRecordDto,
  validateUpdateWorkRecordDto,
  type WorkRecordValidationError,
} from './validation';

// Factories
export {
  // Table factory
  createTable,
  createTableWithValidation,
  createDefaultWorkState,
  createCompletedWorkState,
  enrichTableWithWorkState,
  createCompleteTable,
  createTablesForGrid,
  generateTableLabel,
  // Project factory
  createProject,
  createProjectWithValidation,
  createProjectWithEmptyStatistics,
  activateProject,
  completeProject,
  archiveProject,
  updateProject,
  // Work record factory
  createWorkRecord,
  createWorkRecordWithValidation,
  completeWorkRecord,
  updateWorkRecord,
  addNoteToWorkRecord,
} from './factories';
