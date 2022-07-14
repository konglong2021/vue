import Vue from 'vue';
Vue.directive('inputTextSentenceCase', (el) => {
    el.value = el.value.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
});
