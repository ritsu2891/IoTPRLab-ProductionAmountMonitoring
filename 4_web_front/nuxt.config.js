export default {
  mode: 'spa',
  head: {
    titleTemplate: '%s - ネジ生産個数モニタリングシステム',
    title: 'ネジ生産個数モニタリングシステム',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  loading: { color: '#fff' },
  buildModules: [
    '@nuxtjs/vuetify',
    '@nuxt/typescript-build'
  ],
  modules: [
    '@nuxtjs/axios',
    [
      '@nuxtjs/dotenv',
      {
        filename: process.env.NODE_ENV !== 'production' ? "./.env.dev" : "./.env.prod"
      }
    ]
  ],
  build: {
    extend (config, { isDev, isClient }) {
      config.devtool = 'eval-source-map'
    }
  }
}
