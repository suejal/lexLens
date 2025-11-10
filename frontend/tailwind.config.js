/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pastel neutral theme
        primary: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d0dae7',
          300: '#a8bcd3',
          400: '#7997ba',
          500: '#5778a3',
          600: '#445f88',
          700: '#384d6f',
          800: '#30415d',
          900: '#2c384e',
        },
        accent: {
          50: '#fef5f8',
          100: '#fde9f0',
          200: '#fcd4e1',
          300: '#f9afc8',
          400: '#f47da6',
          500: '#ea5383',
          600: '#d63368',
          700: '#b82454',
          800: '#982148',
          900: '#7f2040',
        },
        neutral: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
        success: {
          light: '#d4edda',
          DEFAULT: '#a3d9a5',
          dark: '#6fbf73',
        },
        warning: {
          light: '#fff3cd',
          DEFAULT: '#ffd97d',
          dark: '#ffb84d',
        },
        danger: {
          light: '#f8d7da',
          DEFAULT: '#f1aeb5',
          dark: '#e57373',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

