/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // MD3 VendelyPro brand tokens
        primary: {
          DEFAULT: '#075ea1',
          container: '#3377bc',
          fixed: '#d2e4ff',
        },
        'on-primary': '#ffffff',
        'on-primary-container': '#fdfcff',
        secondary: {
          DEFAULT: '#595c7b',
          container: '#d8dafe',
          fixed: '#dfe0ff',
        },
        'on-secondary': '#ffffff',
        'on-secondary-container': '#5b5f7d',
        tertiary: {
          DEFAULT: '#585d61',
          fixed: '#dfe3e8',
        },
        'on-tertiary-fixed-variant': '#42474b',
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
        surface: {
          DEFAULT: '#f8f9ff',
          dim: '#cbdbf5',
          bright: '#f8f9ff',
          variant: '#d3e4fe',
          container: {
            DEFAULT: '#e5eeff',
            low: '#eff4ff',
            lowest: '#ffffff',
            high: '#dce9ff',
            highest: '#d3e4fe',
          },
        },
        'on-surface': '#0b1c30',
        'on-surface-variant': '#414750',
        background: '#f8f9ff',
        'on-background': '#0b1c30',
        outline: {
          DEFAULT: '#717782',
          variant: '#c1c7d2',
        },
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
        'inverse-primary': '#a1c9ff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'screen-md': '685px',
      },
    },
  },
  plugins: [],
};
