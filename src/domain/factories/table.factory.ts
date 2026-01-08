/**
 * MST Domain Factories - Table
 * 
 * Factory funkce pro vytváření table entit.
 * Zajišťuje konzistentní vytváření entit s validací.
 */

import type {
  Table,
  TableWorkState,
  TableWithCalculations,
  TableWithWorkState,
  CreateTableDto,
  IdGenerator,
  Result,
} from '../types';
import { WORK_STATUS } from '../constants';
import { validateCreateTableDto, type TableValidationError } from '../validation';
import { enrichTableWithCalculations } from '../calculations';
import { success, failure } from '../types';

/**
 * Výchozí ID generátor (může být nahrazen)
 */
const defaultIdGenerator: IdGenerator = () =>
  `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Vytvoří novou table entitu
 */
export function createTable(
  dto: CreateTableDto,
  idGenerator: IdGenerator = defaultIdGenerator
): Table {
  const now = Date.now();

  return {
    id: idGenerator(),
    projectId: dto.projectId,
    position: dto.position,
    size: dto.size,
    label: dto.label,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Vytvoří table s validací
 */
export function createTableWithValidation(
  input: unknown,
  idGenerator: IdGenerator = defaultIdGenerator
): Result<Table, TableValidationError> {
  const validationResult = validateCreateTableDto(input);

  if (!validationResult.success) {
    return validationResult;
  }

  return success(createTable(validationResult.data, idGenerator));
}

/**
 * Vytvoří výchozí work state pro table
 */
export function createDefaultWorkState(tableId: string): TableWorkState {
  return {
    tableId,
    status: WORK_STATUS.pending,
  };
}

/**
 * Vytvoří completed work state
 */
export function createCompletedWorkState(
  tableId: string,
  workRecordId: string
): TableWorkState {
  return {
    tableId,
    status: WORK_STATUS.completed,
    lastWorkRecordId: workRecordId,
    completedAt: Date.now(),
  };
}

/**
 * Rozšíří table o work state
 */
export function enrichTableWithWorkState(
  table: TableWithCalculations,
  workState?: TableWorkState
): TableWithWorkState {
  return {
    ...table,
    workState: workState || createDefaultWorkState(table.id),
  };
}

/**
 * Vytvoří kompletní table s kalkulacemi a work state
 */
export function createCompleteTable(
  dto: CreateTableDto,
  idGenerator: IdGenerator = defaultIdGenerator
): TableWithWorkState {
  const table = createTable(dto, idGenerator);
  const tableWithCalc = enrichTableWithCalculations(table);
  return enrichTableWithWorkState(tableWithCalc);
}

/**
 * Vytvoří pole stolů pro celý grid
 */
export function createTablesForGrid(
  projectId: string,
  rows: number,
  columns: number,
  defaultSize: 'large' | 'medium' | 'small' = 'large',
  idGenerator: IdGenerator = defaultIdGenerator
): readonly Table[] {
  const tables: Table[] = [];

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const table = createTable(
        {
          projectId,
          position: { row, column },
          size: defaultSize,
        },
        idGenerator
      );
      tables.push(table);
    }
  }

  return tables;
}

/**
 * Generuje label pro stůl na základě pozice
 */
export function generateTableLabel(row: number, column: number): string {
  const rowLabel = String.fromCharCode(65 + row); // A, B, C, ...
  const columnLabel = column + 1; // 1, 2, 3, ...
  return `${rowLabel}${columnLabel}`;
}
