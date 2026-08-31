/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        canvas: {
          DEFAULT: '#080D1A',
          subtle: '#040812',
        },
        surface: {
          DEFAULT: '#0F172A',
          alt: '#1E293B',
          hover: '#182438',
          active: '#23324D',
        },
        border: {
          subtle: '#1E293B',
          strong: '#334155',
          focus: '#3B82F6',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        advisory: {
          DEFAULT: '#0891B2',
          light: '#06B6D4',
          subtle: 'rgba(8, 145, 178, 0.12)',
          border: 'rgba(8, 145, 178, 0.3)',
        },
        resolved: {
          DEFAULT: '#059669',
          light: '#10B981',
          subtle: 'rgba(5, 150, 105, 0.12)',
          border: 'rgba(5, 150, 105, 0.3)',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#F59E0B',
          subtle: 'rgba(217, 119, 6, 0.12)',
          border: 'rgba(217, 119, 6, 0.3)',
        },
        critical: {
          DEFAULT: '#E11D48',
          light: '#F43F5E',
          subtle: 'rgba(225, 29, 72, 0.12)',
          border: 'rgba(225, 29, 72, 0.3)',
        },
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
        'elevated': '0 10px 30px -4px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}
