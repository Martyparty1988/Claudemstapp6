/**
 * MST Tooltip & Popover Components - 2026 Edition
 * 
 * Moderní tooltipy a popovers s animacemi.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ============ TOOLTIP ============

export interface TooltipProps {
  /** Obsah tooltipu */
  content: React.ReactNode;
  /** Element, ke kterému se tooltip váže */
  children: React.ReactElement;
  /** Pozice */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay před zobrazením (ms) */
  delay?: number;
  /** Varianta */
  variant?: 'dark' | 'light' | 'glass';
  /** Disabled */
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  variant = 'dark',
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showTooltip = useCallback(() => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay, disabled]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  // Vypočítat pozici
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const spacing = 8;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = trigger.left + trigger.width / 2 - tooltip.width / 2;
        y = trigger.top - tooltip.height - spacing;
        break;
      case 'bottom':
        x = trigger.left + trigger.width / 2 - tooltip.width / 2;
        y = trigger.bottom + spacing;
        break;
      case 'left':
        x = trigger.left - tooltip.width - spacing;
        y = trigger.top + trigger.height / 2 - tooltip.height / 2;
        break;
      case 'right':
        x = trigger.right + spacing;
        y = trigger.top + trigger.height / 2 - tooltip.height / 2;
        break;
    }

    // Držet v viewportu
    x = Math.max(8, Math.min(x, window.innerWidth - tooltip.width - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - tooltip.height - 8));

    setCoords({ x, y });
  }, [isVisible, position]);

  const variantStyles = {
    dark: 'bg-slate-900 text-white shadow-lg',
    light: 'bg-white text-slate-900 shadow-lg border border-slate-200',
    glass: 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-glass text-slate-900 dark:text-white shadow-glass border border-white/30 dark:border-slate-700/30',
  };

  const arrowStyles = {
    dark: 'border-slate-900',
    light: 'border-white',
    glass: 'border-white/80 dark:border-slate-800/80',
  };

  return (
    <>
      {React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
      })}

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            fixed z-50
            px-3 py-2 rounded-lg
            text-sm font-medium
            ${variantStyles[variant]}
            animate-fade-in
            pointer-events-none
          `}
          style={{
            left: coords.x,
            top: coords.y,
          }}
        >
          {content}
          
          {/* Arrow */}
          <div
            className={`
              absolute w-2 h-2 rotate-45
              ${arrowStyles[variant]}
              ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r' : ''}
              ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2 border-t border-l' : ''}
              ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2 border-t border-r' : ''}
              ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2 border-b border-l' : ''}
              ${variant === 'dark' ? 'bg-slate-900' : variant === 'light' ? 'bg-white' : 'bg-white/80 dark:bg-slate-800/80'}
            `}
          />
        </div>
      )}
    </>
  );
}

// ============ POPOVER ============

export interface PopoverProps {
  /** Obsah popoveru */
  content: React.ReactNode;
  /** Trigger element */
  children: React.ReactElement;
  /** Pozice */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Trigger type */
  trigger?: 'click' | 'hover';
  /** Kontrolované otevření */
  isOpen?: boolean;
  /** Callback při změně stavu */
  onOpenChange?: (isOpen: boolean) => void;
  /** Šířka */
  width?: number | 'auto' | 'trigger';
}

export function Popover({
  content,
  children,
  position = 'bottom',
  trigger = 'click',
  isOpen: controlledIsOpen,
  onOpenChange,
  width = 'auto',
}: PopoverProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen ?? internalIsOpen;
  
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const setIsOpen = useCallback((open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  }, [onOpenChange]);

  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, setIsOpen]);

  // Pozice
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !popoverRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const popover = popoverRef.current.getBoundingClientRect();
    const spacing = 8;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = trigger.left + trigger.width / 2 - popover.width / 2;
        y = trigger.top - popover.height - spacing;
        break;
      case 'bottom':
        x = trigger.left + trigger.width / 2 - popover.width / 2;
        y = trigger.bottom + spacing;
        break;
      case 'left':
        x = trigger.left - popover.width - spacing;
        y = trigger.top + trigger.height / 2 - popover.height / 2;
        break;
      case 'right':
        x = trigger.right + spacing;
        y = trigger.top + trigger.height / 2 - popover.height / 2;
        break;
    }

    x = Math.max(8, Math.min(x, window.innerWidth - popover.width - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - popover.height - 8));

    setCoords({ x, y });
  }, [isOpen, position]);

  const triggerProps = trigger === 'click' 
    ? { onClick: toggle }
    : { onMouseEnter: () => setIsOpen(true), onMouseLeave: () => setIsOpen(false) };

  const popoverWidth = width === 'trigger' && triggerRef.current 
    ? triggerRef.current.getBoundingClientRect().width 
    : width === 'auto' 
      ? undefined 
      : width;

  return (
    <>
      {React.cloneElement(children, {
        ref: triggerRef,
        ...triggerProps,
      })}

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          <div
            ref={popoverRef}
            className={`
              fixed z-50
              bg-white dark:bg-slate-800
              rounded-2xl
              shadow-xl
              border border-slate-200/50 dark:border-slate-700/50
              animate-scale-in origin-top
              overflow-hidden
            `}
            style={{
              left: coords.x,
              top: coords.y,
              width: popoverWidth,
            }}
            onMouseEnter={trigger === 'hover' ? () => setIsOpen(true) : undefined}
            onMouseLeave={trigger === 'hover' ? () => setIsOpen(false) : undefined}
          >
            {content}
          </div>
        </>
      )}
    </>
  );
}

// ============ DROPDOWN MENU ============

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface DropdownMenuProps {
  /** Položky menu */
  items: DropdownItem[];
  /** Trigger element */
  children: React.ReactElement;
  /** Pozice */
  position?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  /** Šířka */
  width?: number;
}

export function DropdownMenu({
  items,
  children,
  position = 'bottom-end',
  width = 200,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuContent = (
    <div className="py-1">
      {items.map((item) => {
        if (item.divider) {
          return <div key={item.id} className="my-1 border-t border-slate-200 dark:border-slate-700" />;
        }

        return (
          <button
            key={item.id}
            onClick={() => {
              if (!item.disabled && item.onClick) {
                item.onClick();
                setIsOpen(false);
              }
            }}
            disabled={item.disabled}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5
              text-left text-sm font-medium
              transition-colors duration-150
              ${item.disabled 
                ? 'text-slate-400 cursor-not-allowed' 
                : item.danger
                  ? 'text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }
            `}
          >
            {item.icon && (
              <span className={`w-5 h-5 ${item.danger ? 'text-error-500' : 'text-slate-400'}`}>
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <Popover
      content={menuContent}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      width={width}
      position={position.startsWith('bottom') ? 'bottom' : 'top'}
    >
      {children}
    </Popover>
  );
}

export default Tooltip;
