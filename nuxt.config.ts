import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['shadcn-nuxt'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      landingRedirectUrl: 'https://example.com'
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  }
})
