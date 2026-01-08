/**
 * MST Accordion Component - 2026 Edition
 * 
 * Rozbalovací sekce s animacemi.
 */

import React, { useState, useRef, useEffect } from 'react';

export interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Povolit více otevřených sekcí */
  allowMultiple?: boolean;
  /** Výchozí otevřené sekce */
  defaultOpen?: string[];
  /** Varianta */
  variant?: 'default' | 'card' | 'ghost';
  /** Callback při změně */
  onChange?: (openIds: string[]) => void;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  variant = 'default',
  onChange,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item?.disabled) return;

    let newOpenIds: string[];
    
    if (openIds.includes(id)) {
      newOpenIds = openIds.filter(openId => openId !== id);
    } else {
      newOpenIds = allowMultiple ? [...openIds, id] : [id];
    }

    setOpenIds(newOpenIds);
    onChange?.(newOpenIds);
  };

  const variantStyles = {
    default: {
      container: 'divide-y divide-slate-200 dark:divide-slate-700',
      item: '',
      header: 'py-4 px-1',
    },
    card: {
      container: 'space-y-3',
      item: 'bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden',
      header: 'py-4 px-5',
    },
    ghost: {
      container: 'space-y-1',
      item: 'rounded-xl',
      header: 'py-3 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={styles.container}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        
        return (
          <AccordionItemComponent
            key={item.id}
            item={item}
            isOpen={isOpen}
            onToggle={() => toggleItem(item.id)}
            variant={variant}
            styles={styles}
          />
        );
      })}
    </div>
  );
}

interface AccordionItemComponentProps {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
  variant: string;
  styles: { item: string; header: string };
}

function AccordionItemComponent({
  item,
  isOpen,
  onToggle,
  variant,
  styles,
}: AccordionItemComponentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [item.content, isOpen]);

  return (
    <div className={`${styles.item} ${item.disabled ? 'opacity-50' : ''}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        disabled={item.disabled}
        className={`
          w-full flex items-center gap-3 text-left
          ${styles.header}
          ${item.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          transition-colors duration-200
        `}
      >
        {/* Icon */}
        {item.icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
            <div className="w-5 h-5 text-slate-600 dark:text-slate-300">
              {item.icon}
            </div>
          </div>
        )}

        {/* Title & Subtitle */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {item.subtitle}
            </p>
          )}
        </div>

        {/* Badge */}
        {item.badge !== undefined && (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
            {item.badge}
          </span>
        )}

        {/* Chevron */}
        <div 
          className={`
            w-5 h-5 text-slate-400 transition-transform duration-300
            ${isOpen ? 'rotate-180' : ''}
          `}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Content */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ height: isOpen ? contentHeight : 0 }}
      >
        <div 
          ref={contentRef}
          className={`
            ${variant === 'card' ? 'px-5 pb-5' : ''}
            ${variant === 'default' ? 'pb-4 px-1' : ''}
            ${variant === 'ghost' ? 'px-4 pb-3' : ''}
            ${item.icon ? 'pl-14' : ''}
          `}
        >
          {item.content}
        </div>
      </div>
    </div>
  );
}

/**
 * FAQ Accordion - předpřipravená FAQ varianta
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const accordionItems: AccordionItem[] = items.map((item, index) => ({
    id: `faq-${index}`,
    title: item.question,
    content: (
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
        {item.answer}
      </p>
    ),
  }));

  return <Accordion items={accordionItems} variant="card" />;
}

export default Accordion;
