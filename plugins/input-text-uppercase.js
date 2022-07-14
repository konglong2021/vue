import Vue from 'vue';
Vue.directive('inputTextUppercase', (el) => {
    el.value = el.value.toUpperCase();
});
