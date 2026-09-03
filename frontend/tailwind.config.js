/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-family-primary)'],
        mono: ['var(--font-family-identifier)'],
        display: ['var(--font-family-display)'],
      },
      colors: {
        canvas: 'var(--color-canvas)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          evidence: 'var(--color-surface-evidence)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          foreground: 'var(--color-accent-foreground)',
        },
        critical: {
          DEFAULT: 'var(--color-critical)',
          surface: 'var(--color-critical-surface)',
        },
        high: {
          DEFAULT: 'var(--color-high)',
          surface: 'var(--color-high-surface)',
        },
        resolved: {
          DEFAULT: 'var(--color-resolved)',
          surface: 'var(--color-resolved-surface)',
        },
        advisory: {
          DEFAULT: 'var(--color-advisory)',
          surface: 'var(--color-advisory-surface)',
        },
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      boxShadow: {
        'none': '0 0 #0000',
        'focus': '0 0 0 2px var(--color-canvas), 0 0 0 4px var(--color-focus)',
      },
    },
  },
  plugins: [],
}
