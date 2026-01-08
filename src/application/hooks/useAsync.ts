/**
 * MST Hook - useAsync
 * 
 * Utility hook pro obecné asynchronní operace.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AsyncState } from '../types/async-state.types';
import {
  idleState,
  loadingState,
  successState,
  errorState,
} from '../types/async-state.types';

/**
 * Options pro useAsync
 */
export interface UseAsyncOptions<T> {
  readonly initialData?: T;
  readonly onSuccess?: (data: T) => void;
  readonly onError?: (error: string) => void;
}

/**
 * Return type pro useAsync
 */
export interface UseAsyncReturn<T, Args extends unknown[]> {
  readonly state: AsyncState<T>;
  readonly execute: (...args: Args) => Promise<T | null>;
  readonly reset: () => void;
  readonly setData: (data: T) => void;
}

/**
 * Generic async hook
 */
export function useAsync<T, Args extends unknown[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, Args> {
  const { initialData, onSuccess, onError } = options;

  const [state, setState] = useState<AsyncState<T>>(
    initialData ? successState(initialData) : idleState()
  );

  // Ref pro tracking mounted state
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    setState((prev) => loadingState(prev.data));

    try {
      const result = await asyncFn(...args);

      if (mountedRef.current) {
        setState(successState(result));
        onSuccess?.(result);
      }

      return result;
    } catch (error) {
      const message = String(error);

      if (mountedRef.current) {
        setState((prev) => errorState(message, prev.data));
        onError?.(message);
      }

      return null;
    }
  }, [asyncFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setState(initialData ? successState(initialData) : idleState());
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState(successState(data));
  }, []);

  return {
    state,
    execute,
    reset,
    setData,
  };
}

/**
 * Hook pro immediate execution
 */
export function useAsyncEffect<T>(
  asyncFn: () => Promise<T>,
  deps: readonly unknown[],
  options: UseAsyncOptions<T> = {}
): AsyncState<T> {
  const { state, execute } = useAsync(asyncFn, options);

  useEffect(() => {
    execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

/**
 * Hook pro debounced async operace
 */
export function useDebouncedAsync<T, Args extends unknown[]>(
  asyncFn: (...args: Args) => Promise<T>,
  delay: number = 300,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, Args> {
  const { state, execute: baseExecute, reset, setData } = useAsync(asyncFn, options);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const execute = useCallback(async (...args: Args): Promise<T | null> => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        const result = await baseExecute(...args);
        resolve(result);
      }, delay);
    });
  }, [baseExecute, delay]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    execute,
    reset,
    setData,
  };
}
