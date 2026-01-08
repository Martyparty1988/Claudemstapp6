/**
 * MST Stepper Component - 2026 Edition
 * 
 * Krokový průvodce s animacemi.
 */

import React from 'react';

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  /** Varianta zobrazení */
  variant?: 'horizontal' | 'vertical';
  /** Velikost */
  size?: 'sm' | 'md' | 'lg';
  /** Barva */
  color?: 'brand' | 'success' | 'accent';
  /** Callback na klik */
  onStepClick?: (index: number) => void;
  /** Povolené kroky (pro navigaci zpět) */
  allowNavigation?: boolean;
}

const colorStyles: Record<string, { active: string; completed: string; line: string }> = {
  brand: {
    active: 'bg-brand-500 text-white ring-4 ring-brand-100 dark:ring-brand-900/50',
    completed: 'bg-brand-500 text-white',
    line: 'bg-brand-500',
  },
  success: {
    active: 'bg-success-500 text-white ring-4 ring-success-100 dark:ring-success-900/50',
    completed: 'bg-success-500 text-white',
    line: 'bg-success-500',
  },
  accent: {
    active: 'bg-accent-500 text-white ring-4 ring-accent-100 dark:ring-accent-900/50',
    completed: 'bg-accent-500 text-white',
    line: 'bg-accent-500',
  },
};

const sizeStyles = {
  sm: {
    circle: 'w-8 h-8 text-sm',
    icon: 'w-4 h-4',
    title: 'text-sm',
    description: 'text-xs',
    line: 'h-0.5',
    lineVertical: 'w-0.5',
  },
  md: {
    circle: 'w-10 h-10 text-base',
    icon: 'w-5 h-5',
    title: 'text-base',
    description: 'text-sm',
    line: 'h-0.5',
    lineVertical: 'w-0.5',
  },
  lg: {
    circle: 'w-12 h-12 text-lg',
    icon: 'w-6 h-6',
    title: 'text-lg',
    description: 'text-base',
    line: 'h-1',
    lineVertical: 'w-1',
  },
};

export function Stepper({
  steps,
  currentStep,
  variant = 'horizontal',
  size = 'md',
  color = 'brand',
  onStepClick,
  allowNavigation = false,
}: StepperProps) {
  const colors = colorStyles[color];
  const sizes = sizeStyles[size];

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const handleClick = (index: number) => {
    if (allowNavigation && index < currentStep && onStepClick) {
      onStepClick(index);
    }
  };

  if (variant === 'vertical') {
    return (
      <div className="flex flex-col">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;
          const isClickable = allowNavigation && index < currentStep;

          return (
            <div key={step.id} className="flex gap-4">
              {/* Circle & Line */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleClick(index)}
                  disabled={!isClickable}
                  className={`
                    ${sizes.circle}
                    rounded-full flex items-center justify-center font-semibold
                    transition-all duration-300
                    ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                    ${status === 'completed' ? colors.completed : ''}
                    ${status === 'active' ? colors.active : ''}
                    ${status === 'pending' ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' : ''}
                  `}
                >
                  {status === 'completed' ? (
                    <CheckIcon className={sizes.icon} />
                  ) : step.icon ? (
                    <span className={sizes.icon}>{step.icon}</span>
                  ) : (
                    index + 1
                  )}
                </button>

                {!isLast && (
                  <div className={`
                    flex-1 my-2 min-h-[24px]
                    ${sizes.lineVertical}
                    ${status === 'completed' ? colors.line : 'bg-slate-200 dark:bg-slate-700'}
                    transition-colors duration-300
                  `} />
                )}
              </div>

              {/* Content */}
              <div className={`pb-6 ${!isLast ? '' : ''}`}>
                <h4 className={`
                  font-medium
                  ${sizes.title}
                  ${status === 'pending' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}
                `}>
                  {step.title}
                </h4>
                {step.description && (
                  <p className={`
                    mt-0.5
                    ${sizes.description}
                    ${status === 'pending' ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}
                  `}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal
  return (
    <div className="flex items-start">
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;
        const isClickable = allowNavigation && index < currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              {/* Circle */}
              <button
                onClick={() => handleClick(index)}
                disabled={!isClickable}
                className={`
                  ${sizes.circle}
                  rounded-full flex items-center justify-center font-semibold
                  transition-all duration-300
                  ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                  ${status === 'completed' ? colors.completed : ''}
                  ${status === 'active' ? colors.active : ''}
                  ${status === 'pending' ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' : ''}
                `}
              >
                {status === 'completed' ? (
                  <CheckIcon className={sizes.icon} />
                ) : step.icon ? (
                  <span className={sizes.icon}>{step.icon}</span>
                ) : (
                  index + 1
                )}
              </button>

              {/* Title & Description */}
              <div className="mt-2 text-center max-w-[100px]">
                <h4 className={`
                  font-medium leading-tight
                  ${sizes.title}
                  ${status === 'pending' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}
                `}>
                  {step.title}
                </h4>
                {step.description && (
                  <p className={`
                    mt-0.5 leading-tight
                    ${sizes.description}
                    ${status === 'pending' ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}
                  `}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connecting line */}
            {!isLast && (
              <div className="flex-1 flex items-center px-2 mt-4">
                <div className={`
                  flex-1 rounded-full
                  ${sizes.line}
                  ${status === 'completed' ? colors.line : 'bg-slate-200 dark:bg-slate-700'}
                  transition-colors duration-300
                `} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Check icon
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/**
 * Simple Step Indicator (dots)
 */
export interface StepIndicatorProps {
  total: number;
  current: number;
  color?: 'brand' | 'success' | 'accent' | 'white';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (index: number) => void;
}

export function StepIndicator({
  total,
  current,
  color = 'brand',
  size = 'md',
  onClick,
}: StepIndicatorProps) {
  const dotSizes = { sm: 'w-1.5 h-1.5', md: 'w-2 h-2', lg: 'w-3 h-3' };
  const activeSizes = { sm: 'w-4', md: 'w-6', lg: 'w-8' };
  
  const dotColors: Record<string, { active: string; inactive: string }> = {
    brand: { active: 'bg-brand-500', inactive: 'bg-slate-300 dark:bg-slate-600' },
    success: { active: 'bg-success-500', inactive: 'bg-slate-300 dark:bg-slate-600' },
    accent: { active: 'bg-accent-500', inactive: 'bg-slate-300 dark:bg-slate-600' },
    white: { active: 'bg-white', inactive: 'bg-white/40' },
  };

  const colors = dotColors[color];

  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        
        return (
          <button
            key={index}
            onClick={() => onClick?.(index)}
            disabled={!onClick}
            className={`
              rounded-full transition-all duration-300
              ${dotSizes[size]}
              ${isActive ? `${activeSizes[size]} ${colors.active}` : colors.inactive}
              ${onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
            `}
          />
        );
      })}
    </div>
  );
}

export default Stepper;
