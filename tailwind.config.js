/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#071826',
          800: '#0d1f2f',
          700: '#11273b',
          600: '#1b3248',
        },
        accent: '#38bdf8',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#fbbf24',
        muted: '#8aa3b8',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
}
