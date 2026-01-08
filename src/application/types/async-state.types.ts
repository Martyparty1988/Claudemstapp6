/**
 * MST Application - Common Types
 * 
 * Sdílené typy pro application layer.
 * Definuje standardní async state pattern pro všechny hooks.
 */

/**
 * Stav asynchronní operace
 */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Generický async state pro hooks
 * UI pracuje POUZE s tímto typem, nikdy přímo s DB
 */
export interface AsyncState<T> {
  readonly status: AsyncStatus;
  readonly data: T | null;
  readonly error: string | null;
}

/**
 * Helper pro vytvoření idle state
 */
export function idleState<T>(): AsyncState<T> {
  return {
    status: 'idle',
    data: null,
    error: null,
  };
}

/**
 * Helper pro vytvoření loading state
 */
export function loadingState<T>(previousData?: T | null): AsyncState<T> {
  return {
    status: 'loading',
    data: previousData ?? null,
    error: null,
  };
}

/**
 * Helper pro vytvoření success state
 */
export function successState<T>(data: T): AsyncState<T> {
  return {
    status: 'success',
    data,
    error: null,
  };
}

/**
 * Helper pro vytvoření error state
 */
export function errorState<T>(error: string, previousData?: T | null): AsyncState<T> {
  return {
    status: 'error',
    data: previousData ?? null,
    error,
  };
}

/**
 * Type guards pro async state
 */
export function isIdle<T>(state: AsyncState<T>): boolean {
  return state.status === 'idle';
}

export function isLoading<T>(state: AsyncState<T>): boolean {
  return state.status === 'loading';
}

export function isSuccess<T>(state: AsyncState<T>): boolean {
  return state.status === 'success';
}

export function isError<T>(state: AsyncState<T>): boolean {
  return state.status === 'error';
}

export function hasData<T>(state: AsyncState<T>): state is AsyncState<T> & { data: T } {
  return state.data !== null;
}

/**
 * Mutation state pro akce (create, update, delete)
 */
export interface MutationState {
  readonly isLoading: boolean;
  readonly error: string | null;
}

/**
 * Default mutation state
 */
export function defaultMutationState(): MutationState {
  return {
    isLoading: false,
    error: null,
  };
}

/**
 * Callback typy pro mutations
 */
export interface MutationCallbacks<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}
