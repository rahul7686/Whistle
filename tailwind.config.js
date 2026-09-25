/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#07090E',
          900: '#0B0E17',
          800: '#121826',
          700: '#1C253B',
          600: '#2A3654',
          accent: '#00F5D4',
          cyan: '#00E5FF',
          teal: '#14B8A6',
          purple: '#8B5CF6',
          glow: '#38BDF8',
          danger: '#F43F5E',
          amber: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
};
