/**
 * MST Input Component - 2026 Glassmorphism Edition
 * 
 * Modern glass input fields with beautiful styling.
 */

import React, { forwardRef, useState } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'glass' | 'solid' | 'outline';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-10 px-3 text-sm rounded-lg',
  md: 'h-12 px-4 text-base rounded-xl',
  lg: 'h-14 px-5 text-lg rounded-xl',
};

const variantStyles: Record<InputVariant, string> = {
  glass: `
    bg-white/60 dark:bg-slate-800/60
    backdrop-blur-glass
    border border-slate-200/50 dark:border-slate-700/50
    focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20
    hover:border-slate-300/50 dark:hover:border-slate-600/50
  `,
  solid: `
    bg-slate-100 dark:bg-slate-800
    border border-transparent
    focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
    hover:bg-slate-200/70 dark:hover:bg-slate-700/70
  `,
  outline: `
    bg-transparent
    border border-slate-300 dark:border-slate-600
    focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
    hover:border-slate-400 dark:hover:border-slate-500
  `,
};

/**
 * Input component
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      variant = 'glass',
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            disabled={disabled}
            className={`
              w-full
              text-slate-900 dark:text-white
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${sizeStyles[size]}
              ${variantStyles[variant]}
              ${hasError ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper text / Error */}
        {(helperText || error) && (
          <p className={`mt-1.5 text-sm ${hasError ? 'text-error-600' : 'text-slate-500 dark:text-slate-400'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * SearchInput - specialized search input
 */
export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onClear, className = '', ...props }, ref) => {
    const showClear = value && String(value).length > 0;

    return (
      <Input
        ref={ref}
        type="search"
        value={value}
        leftIcon={<SearchIcon />}
        rightIcon={
          showClear && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <ClearIcon />
            </button>
          ) : undefined
        }
        className={className}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

/**
 * PasswordInput - input with show/hide toggle
 */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  ({ ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

/**
 * TextArea - multiline input
 */
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: InputVariant;
  fullWidth?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      helperText,
      error,
      variant = 'glass',
      fullWidth = true,
      disabled,
      className = '',
      rows = 4,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          disabled={disabled}
          rows={rows}
          className={`
            w-full px-4 py-3 rounded-xl
            text-slate-900 dark:text-white
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            transition-all duration-200
            resize-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${variantStyles[variant]}
            ${hasError ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''}
            ${className}
          `}
          {...props}
        />

        {(helperText || error) && (
          <p className={`mt-1.5 text-sm ${hasError ? 'text-error-600' : 'text-slate-500 dark:text-slate-400'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

/**
 * Icons
 */
function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

/**
 * useSearch hook - search s debounce
 */
export interface UseSearchOptions {
  debounceMs?: number;
  minLength?: number;
}

export function useSearch<T>(
  items: readonly T[],
  searchFn: (item: T, query: string) => boolean,
  options: UseSearchOptions = {}
) {
  const { debounceMs = 300, minLength = 0 } = options;
  
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  
  // Debounce effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [query, debounceMs]);
  
  // Filter items
  const filteredItems = React.useMemo(() => {
    if (debouncedQuery.length < minLength) {
      return items;
    }
    return items.filter((item) => searchFn(item, debouncedQuery.toLowerCase()));
  }, [items, debouncedQuery, minLength, searchFn]);
  
  const clearSearch = React.useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);
  
  return {
    query,
    setQuery,
    debouncedQuery,
    filteredItems,
    clearSearch,
    isSearching: query !== debouncedQuery,
    hasQuery: query.length > 0,
  };
}

export default Input;
