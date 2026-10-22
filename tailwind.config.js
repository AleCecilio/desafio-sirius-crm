/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class', // o toggle adiciona/remove a classe "dark" no <html>
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      colors: {
        // Tokens que mudam com o tema (valores em index.css)
        canvas: token('canvas'),
        surface: token('surface'),
        raised: token('raised'),
        line: token('line'),
        ink: token('ink'),
        mute: token('mute'),
        gold: token('gold'),
        sidebar: token('sidebar'),
        // Fixos da marca (theme-color do site da Sirius: #122648)
        navy: { DEFAULT: '#122648', soft: '#1D3A6B' },
        'gold-soft': '#E0C079',
      },
    },
  },
  plugins: [],
};