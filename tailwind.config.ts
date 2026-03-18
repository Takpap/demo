import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './components/**/*.{ts,tsx,vue}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config
