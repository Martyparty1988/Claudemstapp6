/**
 * MST Domain Constants - Table Configuration
 * 
 * Tyto konstanty definují business pravidla pro solární stoly.
 * NESMÍ být měněny v UI vrstvě.
 */

/**
 * Velikosti stolů a jejich mapování na počet stringů
 */
export const TABLE_SIZE_TO_STRINGS = {
  large: 2,
  medium: 1.5,
  small: 1,
} as const;

/**
 * Počet panelů na jeden string
 */
export const PANELS_PER_STRING = 28;

/**
 * Výkon jednoho panelu v kWp
 * Standardní hodnota pro kalkulace
 */
export const KWP_PER_PANEL = 0.4;

/**
 * Typy velikostí stolů
 */
export type TableSize = keyof typeof TABLE_SIZE_TO_STRINGS;

/**
 * Validní velikosti stolů jako array pro validaci
 */
export const VALID_TABLE_SIZES: readonly TableSize[] = ['large', 'medium', 'small'] as const;
