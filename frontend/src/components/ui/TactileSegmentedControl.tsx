import React, { useRef } from 'react';
import { motion } from 'framer-motion';

export interface TabOption<T extends string> {
  id: T;
  label: string;
  badge?: string | number;
}

interface TactileSegmentedControlProps<T extends string> {
  options: TabOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
  layoutId?: string;
}

export function TactileSegmentedControl<T extends string>({
  options,
  activeId,
  onChange,
  className = '',
  layoutId = 'tactile-segmented-active',
}: TactileSegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % options.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + options.length) % options.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = options.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    onChange(options[newIndex].id);
    const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
    buttons?.[newIndex]?.focus();
  };

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={`inline-flex items-center p-1 bg-surface-raised border border-rule rounded-xs gap-1 ${className}`}
    >
      {options.map((option, idx) => {
        const isActive = option.id === activeId;
        return (
          <button
            key={option.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(option.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`relative px-3 py-1.5 text-xs font-medium rounded-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ink ${
              isActive ? 'text-ink' : 'text-ink-secondary hover:text-ink'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-surface border border-rule/80 rounded-xs shadow-subtle -z-10"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span>{option.label}</span>
              {option.badge !== undefined && (
                <span className="font-mono text-[10px] px-1.5 py-0.2 bg-canvas border border-rule text-ink-secondary rounded-xs">
                  {option.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
