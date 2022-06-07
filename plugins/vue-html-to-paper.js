import Vue from 'vue';
import VueHtmlToPaper from 'vue-html-to-paper';
const options = {
  name: '_blank',
  specs: [
    'fullscreen=no',
    'titlebar=no',
    'scrollbars=no'
  ],
  styles: [
    // 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
    // 'https://unpkg.com/kidlat-css/css/kidlat.css',
    // '~/static/css/app.css',
  ],
  autoClose: true,
};

Vue.use(VueHtmlToPaper, options);