export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'fitme_front',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/axios'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    'cookie-universal-nuxt'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: 'http://localhost:4000/api'
  },

  router: {
    middleware: ['auth'],
    extendRoutes(routes, resolve) {
      // Fonction pour vérifier l'existence d'une route par nom
      const addRoute = (name, path, component) => {
        if (!routes.some(route => route.name === name)) {
          routes.push({ name, path, component });
        }
      };

      addRoute('register-token', '/register/:token?', resolve(__dirname, 'pages/register.vue'));
      addRoute('adminDashboard', '/admin/adminDashboard', resolve(__dirname, 'pages/admin/adminDashboard.vue'));
      addRoute('exercices', '/admin/exercices', resolve(__dirname, 'pages/admin/exercices.vue'));
      addRoute('groupeMusculaire', '/admin/groupeMusculaire', resolve(__dirname, 'pages/admin/groupeMusculaire.vue'));
      addRoute('invitations', '/admin/invitations', resolve(__dirname, 'pages/admin/invitations.vue'));
      addRoute('utilisateurs', '/admin/utilisateurs', resolve(__dirname, 'pages/admin/utilisateurs.vue'));
      addRoute('bannissement', '/bannissement', resolve(__dirname, 'pages/bannissement.vue'));
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
