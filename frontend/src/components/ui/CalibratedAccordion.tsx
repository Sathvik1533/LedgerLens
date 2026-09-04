import React, { useState } from 'react';

interface CalibratedAccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

interface CalibratedAccordionProps {
  items: CalibratedAccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export const CalibratedAccordion: React.FC<CalibratedAccordionProps> = ({
  items,
  allowMultiple = false,
  className = '',
}) => {
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    items.forEach((item) => {
      if (item.defaultOpen) initial.add(item.id);
    });
    return initial;
  });

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`divide-y divide-rule border-y border-rule ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const panelId = `accordion-panel-${item.id}`;
        const buttonId = `accordion-button-${item.id}`;

        return (
          <div key={item.id} className="py-1">
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
              className="w-full flex items-baseline justify-between py-4 text-left transition-colors hover:text-ink focus:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            >
              <div className="space-y-0.5 pr-4">
                <span className="font-editorial text-lg sm:text-xl font-medium text-ink block">
                  {item.title}
                </span>
                {item.subtitle && (
                  <span className="text-xs font-mono text-ink-secondary block">
                    {item.subtitle}
                  </span>
                )}
              </div>
              <span
                className={`font-mono text-xs text-ink-muted transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-90 text-ink' : ''
                }`}
                aria-hidden="true"
              >
                &rarr;
              </span>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div className="pb-5 pt-1 text-sm text-ink-secondary leading-relaxed font-sans">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
