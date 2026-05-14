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
        /* Palette marron / noir / blanc / gris */
        primary: {
          50:  '#f7f2ed',
          100: '#efe2d6',
          200: '#e0cfbb',
          300: '#cfb398',
          400: '#b8895f',
          500: '#9a6a3c',
          600: '#7c542f',
          700: '#5d4124',
          800: '#3f2d1a',
          900: '#24170c',
        },
        accent: {
          400: '#b8895f',
          500: '#9a6a3c',
          600: '#7c542f',
        }
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'Georgia', 'serif'],
        'body':    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-soft':'bounceSoft 0.6s ease-out',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        bounceSoft:{ '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
      },
    },
  },
  plugins: [],
}
