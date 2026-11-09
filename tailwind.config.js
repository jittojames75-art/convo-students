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
        mac: {
          blue: '#0A84FF',
          dark: '#16181D',
          charcoal: '#0F1115',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-pastel': '0 8px 32px 0 rgba(199, 125, 255, 0.15)',
        'glass-glow': '0 0 25px rgba(10, 132, 255, 0.25)',
      },
      backdropBlur: {
        'xs': '2px',
        'md': '12px',
        'lg': '20px',
        'xl': '30px',
      }
    },
  },
  plugins: [],
}

