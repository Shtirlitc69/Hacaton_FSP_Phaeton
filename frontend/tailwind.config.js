/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fsp: {
          dark: '#1E1B4B',     // Глубокий темно-синий
          purple: '#4A0E4E',   // Фирменный глубокий фиолетовый ФСП
          primary: '#5E17EB',  // Яркий брендовый фиолетовый
          light: '#7C3AED',    // Акцентный фиолетовый
          lavender: '#F5F3FF', // Фоновый лавандовый
          neon: '#06B6D4',     // Неоновый циан для технологических бейджей
          gold: '#F59E0B'      // Золото соревнований ФСП
        }
      }
    },
  },
  plugins: [],
}
