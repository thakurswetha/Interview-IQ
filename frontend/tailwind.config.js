/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#070b14',
          900: '#0b1120',
          850: '#0f172a',
          800: '#151f33',
          700: '#1e293b',
          600: '#334155',
          500: '#475569'
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          accent: '#8b5cf6',
          cyan: '#06b6d4'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sound-wave': 'wave 1.2s ease-in-out infinite alternate',
        'neural-glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        wave: {
          '0%': { transform: 'scaleY(0.3)' },
          '100%': { transform: 'scaleY(1.3)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}

