/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'mineral-green': {
          '50': '#f5f8f6',
          '100': '#ddeae2',
          '200': '#bbd4c6',
          '300': '#92b6a3',
          '400': '#6b9681',
          '500': '#517b67',
          '600': '#3f6252',
          '700': '#395649', // COLOR PRINCIPAL OFICIAL ESPOCH NOC
          '800': '#2d4239',
          '900': '#293831',
          '950': '#141f1b'
        },
        primary: {
          DEFAULT: '#395649',
          hover: '#3f6252',
          active: '#2d4239'
        },
        noc: {
          up: '#10B981',
          'up-bg': '#ECFDF5',
          down: '#EF4444',
          'down-bg': '#FEF2F2',
          unreachable: '#F59E0B',
          'unreachable-bg': '#FFFBEB',
          pending: '#6B7280',
          'pending-bg': '#F3F4F6',
          destructive: '#C00000'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    }
  },
  plugins: []
};
