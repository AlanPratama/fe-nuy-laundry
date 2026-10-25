/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#EFEFFF',
          100: '#E1E1FF',
          200: '#C6C6FF',
          300: '#9F9FFF',
          500: '#5B5BF7',
          600: '#4343E6',
          700: '#3434C2',
        },
        ink: {
          DEFAULT: '#0F0F3D',
          soft: '#6B6B8D',
        },
        sun: '#FFC93C',
        mint: '#3DDC97',
      },
      boxShadow: {
        soft: '0 20px 50px -20px rgba(67, 67, 230, 0.35)',
        card: '0 10px 40px -15px rgba(15, 15, 61, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
