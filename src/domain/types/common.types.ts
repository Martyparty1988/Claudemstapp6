/**
 * MST Domain Types - Common Utilities
 * 
 * Sdílené utility typy pro celou domain vrstvu.
 */

/**
 * Generický result type pro domain operace
 */
export type Result<T, E = Error> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

/**
 * Helper pro vytvoření úspěšného výsledku
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Helper pro vytvoření chybového výsledku
 */
export function failure<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Typ pro paginované výsledky
 */
export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

/**
 * Typ pro časové rozmezí
 */
export interface TimeRange {
  readonly from: number;
  readonly to: number;
}

/**
 * Entita s ID a časovými značkami
 */
export interface BaseEntity {
  readonly id: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

/**
 * Typ pro ID generátor
 */
export type IdGenerator = () => string;
