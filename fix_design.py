import json
import os
import re

# 1. Update tailwind.config.js
tailwind_config_path = 'frontend/tailwind.config.js'
with open(tailwind_config_path, 'r') as f:
    content = f.read()

new_colors = """
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
"""

content = re.sub(r'colors:\s*\{[^\}]+\},', 'colors: {' + new_colors + '},', content, flags=re.DOTALL)
# also we need to update fonts
fonts = """
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        display: ['Fraunces', 'serif'],
      },
"""
content = re.sub(r'fontFamily:\s*\{[^\}]+\},', fonts, content, flags=re.DOTALL)

with open(tailwind_config_path, 'w') as f:
    f.write(content)

# 2. Update index.css
index_css_path = 'frontend/src/index.css'
with open(index_css_path, 'r') as f:
    css_content = f.read()

new_css = """@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-paper-0 text-ink-700 font-sans;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply text-ink-900;
  }
}

/* Tabular numbers for financial precision */
.font-tabular {
  font-variant-numeric: tabular-nums;
}

/* Card styling conforming to design system tokens */
.control-panel {
  @apply bg-paper-1 border border-rule-300 transition-colors duration-150 ease-out;
}

.control-panel:hover {
  @apply border-ink-700;
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-paper-0;
}

::-webkit-scrollbar-thumb {
  @apply bg-rule-300 rounded;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-ink-700;
}

@layer utilities {
  .focus-ring {
    @apply outline-none ring-2 ring-transparent ring-offset-2;
  }
  .focus-ring:focus-visible {
    @apply ring-ink-900;
  }
}
"""
with open(index_css_path, 'w') as f:
    f.write(new_css)

print("Updated tailwind and index.css")
