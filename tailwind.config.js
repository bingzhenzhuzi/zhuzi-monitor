/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#05070d',
          900: '#0a0e1a',
          850: '#0d1424',
          800: '#111a2e',
          700: '#1a2740',
          600: '#243454',
        },
        accent: {
          DEFAULT: '#22d3ee',
          dim: '#0891b2',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(34, 211, 238, 0.12)',
      },
    },
  },
  plugins: [],
}
