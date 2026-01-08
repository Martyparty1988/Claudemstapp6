/**
 * MST Mappers - FieldMap
 * 
 * Transformace table entit na view-modely pro FieldMap.
 */

import type {
  TableWithWorkState,
  Project,
} from '../../domain';
import {
  formatKwp,
  sumTableValues,
  generateTableLabel,
  WORK_STATUS,
} from '../../domain';
import type {
  TableCellVM,
  FieldMapVM,
  FieldMapStatisticsVM,
  FieldMapSelectionVM,
  SelectionSummaryVM,
} from '../view-models';
import {
  WORK_STATUS_COLORS,
  WORK_STATUS_LABELS,
  TABLE_SIZE_LABELS,
  EMPTY_SELECTION,
} from '../view-models';

/**
 * Mapuje TableWithWorkState na TableCellVM
 */
export function mapTableToCell(
  table: TableWithWorkState,
  isSelected: boolean = false
): TableCellVM {
  const status = table.workState.status;

  return {
    id: table.id,
    row: table.position.row,
    column: table.position.column,
    label: table.label ?? generateTableLabel(table.position.row, table.position.column),
    size: table.size,
    sizeLabel: TABLE_SIZE_LABELS[table.size],
    status,
    statusColor: WORK_STATUS_COLORS[status],
    isSelected,
    isCompleted: status === WORK_STATUS.completed,
    strings: table.calculated.strings,
    panels: table.calculated.panels,
    kwp: formatKwp(table.calculated.kwp),
  };
}

/**
 * Mapuje pole stolů na TableCellVM[]
 */
export function mapTablesToGrid(
  tables: readonly TableWithWorkState[],
  selectedIds: ReadonlySet<string> = new Set()
): readonly TableCellVM[] {
  return tables.map((table) => mapTableToCell(table, selectedIds.has(table.id)));
}

/**
 * Vypočítá statistiky pro FieldMap
 */
export function calculateFieldMapStatistics(
  tables: readonly TableWithWorkState[],
  todayCompletedCount: number = 0
): FieldMapStatisticsVM {
  const totalTables = tables.length;
  let completedTables = 0;
  let pendingTables = 0;

  for (const table of tables) {
    if (table.workState.status === WORK_STATUS.completed) {
      completedTables++;
    } else if (table.workState.status === WORK_STATUS.pending) {
      pendingTables++;
    }
  }

  const completionPercentage =
    totalTables > 0 ? Math.round((completedTables / totalTables) * 100) : 0;

  return {
    totalTables,
    completedTables,
    pendingTables,
    completionPercentage,
    completionLabel: `${completionPercentage}%`,
    todayCompleted: todayCompletedCount,
  };
}

/**
 * Mapuje data na FieldMapVM
 */
export function mapToFieldMapVM(
  project: Project,
  tables: readonly TableWithWorkState[],
  selectedIds: ReadonlySet<string> = new Set(),
  todayCompletedCount: number = 0
): FieldMapVM {
  return {
    projectId: project.id,
    projectName: project.name,
    rows: project.gridConfig.rows,
    columns: project.gridConfig.columns,
    tables: mapTablesToGrid(tables, selectedIds),
    statistics: calculateFieldMapStatistics(tables, todayCompletedCount),
  };
}

/**
 * Vypočítá souhrn pro vybrané stoly
 */
export function calculateSelectionSummary(
  selectedTables: readonly TableWithWorkState[]
): SelectionSummaryVM {
  if (selectedTables.length === 0) {
    return EMPTY_SELECTION.summary;
  }

  const values = sumTableValues(selectedTables);

  return {
    tableCount: selectedTables.length,
    totalStrings: values.strings,
    totalPanels: values.panels,
    totalKwp: formatKwp(values.kwp),
  };
}

/**
 * Mapuje selection state na view-model
 */
export function mapToSelectionVM(
  allTables: readonly TableWithWorkState[],
  selectedIds: ReadonlySet<string>
): FieldMapSelectionVM {
  if (selectedIds.size === 0) {
    return EMPTY_SELECTION;
  }

  // Filtrujeme vybrané stoly
  const selectedTables = allTables.filter((t) => selectedIds.has(t.id));
  const selectedCells = selectedTables.map((t) => mapTableToCell(t, true));

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    isMultiSelect: selectedIds.size > 1,
    canConfirm: selectedIds.size > 0,
    selectedTables: selectedCells,
    summary: calculateSelectionSummary(selectedTables),
  };
}

/**
 * Filtruje stoly podle statusu
 */
export function filterTablesByStatus(
  tables: readonly TableCellVM[],
  status: 'pending' | 'completed' | 'all'
): readonly TableCellVM[] {
  if (status === 'all') {
    return tables;
  }

  return tables.filter((t) =>
    status === 'completed'
      ? t.status === WORK_STATUS.completed
      : t.status === WORK_STATUS.pending
  );
}

/**
 * Najde stůl podle pozice
 */
export function findTableAtPosition(
  tables: readonly TableCellVM[],
  row: number,
  column: number
): TableCellVM | undefined {
  return tables.find((t) => t.row === row && t.column === column);
}

/**
 * Získá sousední stoly (pro případné rozšíření selection)
 */
export function getAdjacentTableIds(
  tables: readonly TableCellVM[],
  tableId: string
): readonly string[] {
  const table = tables.find((t) => t.id === tableId);
  if (!table) return [];

  const { row, column } = table;
  const adjacent: string[] = [];

  // Hledáme sousedy (nahoru, dolů, vlevo, vpravo)
  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  for (const { dr, dc } of directions) {
    const neighbor = findTableAtPosition(tables, row + dr, column + dc);
    if (neighbor) {
      adjacent.push(neighbor.id);
    }
  }

  return adjacent;
}
