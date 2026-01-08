/**
 * MST Domain Types - Table
 * 
 * Definice typů pro solární stoly.
 * Čistá TypeScript definice bez React závislostí.
 */

import type { TableSize } from '../constants';
import type { WorkStatus } from '../constants';

/**
 * Identifikátor stolu v mřížce
 */
export interface TablePosition {
  readonly row: number;
  readonly column: number;
}

/**
 * Základní entita stolu
 */
export interface Table {
  readonly id: string;
  readonly projectId: string;
  readonly position: TablePosition;
  readonly size: TableSize;
  readonly label?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

/**
 * Stav práce na stole
 */
export interface TableWorkState {
  readonly tableId: string;
  readonly status: WorkStatus;
  readonly lastWorkRecordId?: string;
  readonly completedAt?: number;
}

/**
 * Vypočtené hodnoty stolu (read-only, generované domain logikou)
 */
export interface TableCalculatedValues {
  readonly strings: number;
  readonly panels: number;
  readonly kwp: number;
}

/**
 * Kompletní stůl s vypočtenými hodnotami
 */
export interface TableWithCalculations extends Table {
  readonly calculated: TableCalculatedValues;
}

/**
 * Stůl s pracovním stavem pro FieldMap
 */
export interface TableWithWorkState extends TableWithCalculations {
  readonly workState: TableWorkState;
}

/**
 * DTO pro vytvoření stolu
 */
export interface CreateTableDto {
  readonly projectId: string;
  readonly position: TablePosition;
  readonly size: TableSize;
  readonly label?: string;
}

/**
 * DTO pro update stolu
 */
export interface UpdateTableDto {
  readonly size?: TableSize;
  readonly label?: string;
}
