import Vue from 'vue';

Vue.directive("colorChange", {
    bind(el, binding) {
        el.style.color = binding.value;
    }
});
