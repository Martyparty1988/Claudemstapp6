/**
 * MST Select Component - 2026 Edition
 * 
 * Moderní select/dropdown s vyhledáváním.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Options */
  options: SelectOption[];
  /** Selected value */
  value?: string;
  /** Callback při změně */
  onChange: (value: string) => void;
  /** Placeholder */
  placeholder?: string;
  /** Label */
  label?: string;
  /** Error */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Disabled */
  disabled?: boolean;
  /** Searchable */
  searchable?: boolean;
  /** Clearable */
  clearable?: boolean;
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Varianta */
  variant?: 'default' | 'glass';
}

const sizeStyles = {
  sm: 'h-10 text-sm',
  md: 'h-12 text-base',
  lg: 'h-14 text-lg',
};

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Vyberte...',
  label,
  error,
  helperText,
  disabled = false,
  searchable = false,
  clearable = false,
  size = 'md',
  variant = 'default',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Filtrované options
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(query) ||
      opt.description?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
    }
  };

  const handleSelect = (val: string) => {
    const option = options.find(opt => opt.value === val);
    if (option?.disabled) return;
    
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const variantStyles = {
    default: `
      bg-white dark:bg-slate-800
      border border-slate-200 dark:border-slate-700
      hover:border-slate-300 dark:hover:border-slate-600
    `,
    glass: `
      bg-white/60 dark:bg-slate-800/60
      backdrop-blur-glass
      border border-white/30 dark:border-slate-700/30
    `,
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen && searchable) {
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full ${sizeStyles[size]} px-4
          flex items-center justify-between gap-3
          rounded-xl
          text-left
          transition-all duration-200
          ${variantStyles[variant]}
          ${error 
            ? 'border-error-500 focus:ring-2 focus:ring-error-500/20' 
            : 'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-brand-500/20 border-brand-500' : ''}
        `}
      >
        {/* Selected value or placeholder */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedOption?.icon && (
            <span className="w-5 h-5 flex-shrink-0 text-slate-500">
              {selectedOption.icon}
            </span>
          )}
          <span className={`truncate ${selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            {selectedOption?.label || placeholder}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <XIcon className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <ChevronDownIcon 
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Error & Helper */}
      {(error || helperText) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-error-600 dark:text-error-400' : 'text-slate-500'}`}>
          {error || helperText}
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
          {/* Search */}
          {searchable && (
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Hledat..."
                className="w-full h-10 px-4 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          )}

          {/* Options */}
          <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                Žádné výsledky
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    disabled={option.disabled}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left
                      transition-colors duration-150
                      ${option.disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isHighlighted
                          ? 'bg-slate-100 dark:bg-slate-700'
                          : ''
                      }
                      ${isSelected ? 'bg-brand-50 dark:bg-brand-900/20' : ''}
                    `}
                  >
                    {/* Icon */}
                    {option.icon && (
                      <span className="w-5 h-5 flex-shrink-0 text-slate-500">
                        {option.icon}
                      </span>
                    )}

                    {/* Label & Description */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>
                        {option.label}
                      </p>
                      {option.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {option.description}
                        </p>
                      )}
                    </div>

                    {/* Check mark */}
                    {isSelected && (
                      <CheckIcon className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * MultiSelect - výběr více hodnot
 */
export interface MultiSelectProps extends Omit<SelectProps, 'value' | 'onChange' | 'clearable'> {
  value: string[];
  onChange: (values: string[]) => void;
  max?: number;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Vyberte...',
  max,
  ...props
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val));
    } else if (!max || value.length < max) {
      onChange([...value, val]);
    }
  };

  const selectedOptions = options.filter(opt => value.includes(opt.value));

  return (
    <div className="relative">
      {props.label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {props.label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !props.disabled && setIsOpen(!isOpen)}
        disabled={props.disabled}
        className={`
          w-full min-h-12 px-4 py-2
          flex items-center flex-wrap gap-2
          bg-white dark:bg-slate-800
          border border-slate-200 dark:border-slate-700
          rounded-xl
          text-left
          transition-all duration-200
          hover:border-slate-300 dark:hover:border-slate-600
          focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
          ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-slate-400">{placeholder}</span>
        ) : (
          selectedOptions.map(opt => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm rounded-lg"
            >
              {opt.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(opt.value);
                }}
                className="hover:text-brand-900 dark:hover:text-brand-100"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </span>
          ))
        )}
        <ChevronDownIcon 
          className={`ml-auto w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
          <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              const isDisabled = Boolean(option.disabled) || (max !== undefined && value.length >= max && !isSelected);
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggle(option.value)}
                  disabled={isDisabled}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    transition-colors duration-150
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-md border-2 flex items-center justify-center
                    ${isSelected 
                      ? 'bg-brand-500 border-brand-500' 
                      : 'border-slate-300 dark:border-slate-600'
                    }
                  `}>
                    {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-slate-900 dark:text-white">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Icons
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default Select;
