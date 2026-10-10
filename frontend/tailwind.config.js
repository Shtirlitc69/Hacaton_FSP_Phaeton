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
          obsidian: '#0B0F19', // Глубокий матовый обсидиан для Bento-карт
          slate: '#0F172A',    // Темный структурный графит
          navy: '#1E293B',     // Бордюры и подложки темных блоков
          cobalt: '#1D4ED8',   // Атлетический кобальт соревнований ФСП
          blue: '#2563EB',     // Первичный технологический синий
          sky: '#0284C7',      // Небесно-лазурный акцент
          cyan: '#06B6D4',     // Технологический циан для бейджей
          gold: '#D97706',     // Олимпийское золото соревнований
          silver: '#64748B',   // Спортивное серебро
          bronze: '#B45309',   // Спортивная бронза
          emerald: '#059669',  // 152-ФЗ щит приватности (изумруд)
          primary: '#1D4ED8',  // Основной цвет бренда (кобальт вместо синт-фиолетового)
          light: '#3B82F6',    // Светлый синий
          lavender: '#EFF6FF', // Чистая легкая лазурь фона
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'bento': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'bento-hover': '0 10px 25px -5px rgba(15, 23, 42, 0.06)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
