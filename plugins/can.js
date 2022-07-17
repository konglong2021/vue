import Vue from 'vue';

Vue.directive('can', (el, binding, vnode) => {
    let permissions = vnode.context.$store.$cookies.get("permissions");
    if(!permissions.includes(binding.value)) {
        el.style.display = 'none';
    }
});
