/**
 * MST DatePicker Component - 2026 Edition
 * 
 * Výběr data s kalendářem.
 */

import React, { useState, useMemo } from 'react';

export interface DatePickerProps {
  /** Vybraný datum */
  value?: Date;
  /** Callback při změně */
  onChange: (date: Date) => void;
  /** Min datum */
  minDate?: Date;
  /** Max datum */
  maxDate?: Date;
  /** Label */
  label?: string;
  /** Placeholder */
  placeholder?: string;
  /** Disabled */
  disabled?: boolean;
  /** Error */
  error?: string;
}

const DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const MONTHS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
];

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  label,
  placeholder = 'Vyberte datum',
  disabled = false,
  error,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Generování dnů v měsíci
  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Pondělí = 0, Neděle = 6
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const result: (Date | null)[] = [];
    
    // Prázdné buňky na začátku
    for (let i = 0; i < startDay; i++) {
      result.push(null);
    }
    
    // Dny v měsíci
    for (let day = 1; day <= daysInMonth; day++) {
      result.push(new Date(year, month, day));
    }

    return result;
  }, [year, month]);

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date): boolean => {
    return value ? date.toDateString() === value.toDateString() : false;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (date: Date) => {
    if (isDateDisabled(date)) return;
    onChange(date);
    setIsOpen(false);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}

      {/* Input trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full h-12 px-4
          flex items-center justify-between gap-3
          bg-white dark:bg-slate-800
          border rounded-xl
          text-left
          transition-all duration-200
          ${error 
            ? 'border-error-500 focus:ring-2 focus:ring-error-500/20' 
            : 'border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-600'}
        `}
      >
        <span className={value ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
          {value ? formatDate(value) : placeholder}
        </span>
        <CalendarIcon className="w-5 h-5 text-slate-400" />
      </button>

      {/* Error */}
      {error && (
        <p className="mt-1.5 text-sm text-error-600 dark:text-error-400">
          {error}
        </p>
      )}

      {/* Calendar dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Calendar */}
          <div className="absolute z-50 mt-2 w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {MONTHS[month]} {year}
              </h3>
              
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 p-2 border-b border-slate-100 dark:border-slate-700">
              {DAYS.map((day) => (
                <div 
                  key={day}
                  className="h-8 flex items-center justify-center text-xs font-medium text-slate-500 dark:text-slate-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 p-2">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-10" />;
                }

                const disabled = isDateDisabled(date);
                const today = isToday(date);
                const selected = isSelected(date);

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => handleSelectDate(date)}
                    disabled={disabled}
                    className={`
                      h-10 rounded-xl text-sm font-medium
                      transition-all duration-150
                      ${disabled 
                        ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                        : selected
                          ? 'bg-brand-500 text-white'
                          : today
                            ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-3 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setViewDate(today);
                  onChange(today);
                  setIsOpen(false);
                }}
                className="px-3 py-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Dnes
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Zavřít
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * DateRangePicker - výběr rozsahu dat
 */
export interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange: (start: Date | undefined, end: Date | undefined) => void;
  label?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  label,
}: DateRangePickerProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <DatePicker
          value={startDate}
          onChange={(date) => onChange(date, endDate)}
          maxDate={endDate}
          placeholder="Od"
        />
        <span className="text-slate-400">—</span>
        <DatePicker
          value={endDate}
          onChange={(date) => onChange(startDate, date)}
          minDate={startDate}
          placeholder="Do"
        />
      </div>
    </div>
  );
}

// Icons
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default DatePicker;
