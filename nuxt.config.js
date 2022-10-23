export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'E-Kang Phone shop',
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
  /*css: [
    '@/static/css/font-awesome.css',
    '@/static/css/app.css'
  ],*/
  css: [
    '~/static/css/simplebar/simplebar.css',
    '~/static/css/metismenu/metisMenu.min.css',
    '~/static/css/perfect-scrollbar/perfect-scrollbar.css',
    '~/static/css/bootstrap.css',
    // '~/static/css/bootstrap-extended.css',
    '~/static/css/font-awesome.css',
    '~/static/css/dark-theme.css',
    '~/static/css/light-theme.css',
    '~/static/css/semi-dark.css',
    '~/static/css/app.css'
  ],
  script: [
    '~/static/js/bootstrap.bundle.min.js',
    '~/static/js/jquery.min.js',
    '~/static/js/bootstrap.js',
    '~/static/js/simplebar/simplebar.min.js',
    '~/static/js/metismenu/metisMenu.min.js',
    '~/static/js/perfect-scrollbar/perfect-scrollbar.js',
    '~/static/js/pace.min.js',
    '~/static/js/app.js'
  ]
  ,

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/fontawesome'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    '@nuxtjs/axios',
    'bootstrap-vue/nuxt',
    '@nuxtjs/proxy',
    'nuxt-vue-multiselect',
    '@nuxtjs/i18n',
    '@nuxtjs/toast',
    'cookie-universal-nuxt',
    '@nuxtjs/moment',
  ],
  router: {
    middleware: ['local-auth', 'check-auth']
  },
  plugins: [
    '~/plugins/util',
    '~/plugins/axios',
    '~/plugins/vue-input-mask',
    '~/plugins/number-only',
    '~/plugins/vee-validate',
    '~/plugins/vue-html-to-paper',
    '~/plugins/vue-barcode',
    '~/plugins/moment',
    '~/plugins/i18n',
    '~/plugins/jquery',
    '~/plugins/input-text-uppercase',
    '~/plugins/input-text-sentence-case',
    '~/plugins/focus',
    '~/plugins/can',
   
  ],

  axios: {
    //baseURL: 'http://188.166.222.154:81/',
    // baseURL: 'http://167.71.11.135/',
     baseURL: 'http://localhost:8000',
    headers: {
      common: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: '',
      }
    },
    proxy: true,
  },
 //https://radiant-tor-18088.herokuapp.com/
  proxy: {
     '/api/': { target: 'http://localhost:8000', pathRewrite: {'^/api/': ''}, changeOrigin: true }
    // '/api/': { target: 'http://167.71.11.135/', pathRewrite: {'^/api/': ''}, changeOrigin: true }
    //'/api/': { target: 'http://188.166.222.154:81/', pathRewrite: {'^/api/': ''}, changeOrigin: true }
  },
  ssr: true,
  target: 'server',

  i18n: {
    locales: [
      {
        code: 'en',
        file: 'en-US.js'
      },
      {
        code: 'kh',
        file: 'kh-KH.js'
      }
    ],
    lazy: true,
    langDir: 'locales/',
    defaultLocale: 'kh'
  },

  toast: {
    position: 'top-center',
    register: [ // Register custom toasts
      {
        name: 'my-error',
        message: 'Oops...Something went wrong',
        options: {
          type: 'error'
        }
      }
    ]
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: ["vee-validate/dist/rules"],
  },
}
