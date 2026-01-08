/**
 * FieldMap Feature - Public API
 * 
 * Hlavní pracovní režim aplikace MST.
 * 
 * PRAVIDLA ARCHITEKTURY:
 * - FieldMap NIKDY nespouští edit projektu
 * - FieldMap NIKDY nevytváří projekt
 * - FieldMap NIKDY přímo neukládá data
 * - Kliknutí na stůl pouze mění UI stav (selection)
 * - Zápis dat JEN přes WorkConfirmationSheet → submitWork()
 */

// Main screen
export { FieldMapScreen } from './FieldMapScreen';
export { default } from './FieldMapScreen';

// Components
export {
  // Grid
  TableGrid,
  TableGridMini,
  TableGridCompact,
  // Selection
  SelectionBar,
  SelectionBarCompact,
  // Sheet
  WorkConfirmationSheet,
  // Stats
  StatsHeader,
  StatsHeaderCompact,
  // Actions
  QuickActions,
  // Selectors
  RowSelector,
  RowSelectorCompact,
  // Filters
  FilterBar,
  FilterBarSimple,
  type TableFilter,
} from './components';
