import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-paper-0 border border-rule-300 rounded-md px-3 py-2 text-sm text-ink-900 focus:outline-none focus:border-ink-900 focus-visible:ring-2 focus-visible:ring-ink-900/20 focus-visible:border-ink-900 transition-all transition-colors shadow-sm"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-ink-700 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border border-rule-300 rounded-md shadow-card overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar" data-lenis-prevent="true">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-paper-0 transition-colors ${
                    value === option.value ? 'bg-paper-1 font-medium text-ink-900' : 'text-ink-700'
                  }`}
                >
                  <span>{option.label}</span>
                  {value === option.value && <Check className="w-3.5 h-3.5 text-ink-900" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
