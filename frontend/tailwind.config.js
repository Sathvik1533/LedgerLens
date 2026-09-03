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
          0: '#FBFAF6',
          1: '#F1EDE4',
        },
        ink: {
          900: '#102B42',
          700: '#334754',
        },
        rule: {
          300: '#C9C5BC',
        },
        source: {
          blue: '#356A88',
        },
        matched: {
          green: '#3E725E',
        },
        ledger: {
          vermilion: '#C6533C',
        },
        advisory: {
          amber: '#B47A43',
        },
        locked: {
          slate: '#65747A',
        },
        audit: {
          violet: '#6E627D',
        },
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.4)',
      },
      transitionDuration: {
        DEFAULT: '180ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease-out',
      },
    },
  },
  plugins: [],
}
