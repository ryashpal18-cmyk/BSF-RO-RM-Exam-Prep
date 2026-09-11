/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#153d2d',
          dark: '#102f23',
          light: '#eaf3ee',
          green2: '#23734e',
          accent: '#f59e0b'
        },
        appbg: '#f2f6f3',
        line: '#dce6df',
        muted: '#68756e'
      },
      fontFamily: {
        hindi: ['Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
