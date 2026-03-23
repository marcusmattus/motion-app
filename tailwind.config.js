/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        octagon: '#1b1b1b',
        neon: '#ADFF2F',
        track: '#0047AB',
        orange: '#FF5F15',
        raw: '#C7C7C5',
        cyber: '#FFD700'
      }
    }
  },
  plugins: []
};
