/**
 * MST Domain Calculations - Table
 * 
 * Čistá business logika pro výpočty související se stoly.
 * ŽÁDNÉ React importy. ŽÁDNÉ side effects.
 */

import {
  TABLE_SIZE_TO_STRINGS,
  PANELS_PER_STRING,
  KWP_PER_PANEL,
  type TableSize,
} from '../constants';
import type {
  Table,
  TableCalculatedValues,
  TableWithCalculations,
} from '../types';

/**
 * Vypočítá počet stringů pro danou velikost stolu
 */
export function calculateStringsForSize(size: TableSize): number {
  return TABLE_SIZE_TO_STRINGS[size];
}

/**
 * Vypočítá počet panelů z počtu stringů
 */
export function calculatePanelsFromStrings(strings: number): number {
  return strings * PANELS_PER_STRING;
}

/**
 * Vypočítá kWp z počtu panelů
 */
export function calculateKwpFromPanels(panels: number): number {
  return panels * KWP_PER_PANEL;
}

/**
 * Vypočítá všechny hodnoty pro stůl na základě jeho velikosti
 */
export function calculateTableValues(size: TableSize): TableCalculatedValues {
  const strings = calculateStringsForSize(size);
  const panels = calculatePanelsFromStrings(strings);
  const kwp = calculateKwpFromPanels(panels);

  return {
    strings,
    panels,
    kwp,
  };
}

/**
 * Rozšíří stůl o vypočtené hodnoty
 */
export function enrichTableWithCalculations(table: Table): TableWithCalculations {
  return {
    ...table,
    calculated: calculateTableValues(table.size),
  };
}

/**
 * Rozšíří pole stolů o vypočtené hodnoty
 */
export function enrichTablesWithCalculations(
  tables: readonly Table[]
): readonly TableWithCalculations[] {
  return tables.map(enrichTableWithCalculations);
}

/**
 * Sečte hodnoty pro více stolů
 */
export function sumTableValues(
  tables: readonly TableWithCalculations[]
): TableCalculatedValues {
  return tables.reduce(
    (acc, table) => ({
      strings: acc.strings + table.calculated.strings,
      panels: acc.panels + table.calculated.panels,
      kwp: acc.kwp + table.calculated.kwp,
    }),
    { strings: 0, panels: 0, kwp: 0 }
  );
}

/**
 * Formátuje kWp hodnotu pro zobrazení
 */
export function formatKwp(kwp: number, decimals: number = 2): string {
  return kwp.toFixed(decimals);
}
