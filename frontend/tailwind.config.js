/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
        display: ['Manrope', 'sans-serif'],
      },
      colors: {
        paper: {
          0: '#F9F9FB', // Institutional Light Canvas
          1: '#FFFFFF', // Clean White Surfaces
        },
        ink: {
          900: '#111827', // Crisp Near-Black
          700: '#4B5563', // Secondary Text
        },
        rule: {
          300: '#E5E7EB', // 1px borders
        },
        source: {
          blue: '#2563EB',
        },
        matched: {
          green: '#059669',
        },
        ledger: {
          vermilion: '#DC2626', // Critical
        },
        advisory: {
          amber: '#D97706', // High / Review
        },
        locked: {
          slate: '#64748B',
        },
        audit: {
          violet: '#7C3AED',
        },
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px', // Restrained craft radius
        'lg': '12px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // Extremely flat, modern shadow
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease-in-out',
      },
    },
  },
  plugins: [],
}
