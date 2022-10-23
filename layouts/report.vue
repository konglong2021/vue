<template>
  <div>
    <div class="main-report" v-if="!isLoading">
      <report-topbar />
      <Nuxt />
    </div>
    <loading v-if="isLoading"></loading>
  </div>
</template>
<script>
export default {
  data() {
    return {
      isLoading: true,
    }
  },
  mounted() {
    let self = this;
    setTimeout(function () {
      self.isLoading = false;
    }, 500);
  }
}
</script>
<style>
.main-report {
  background-color: #868686;
  padding-bottom: 20px;
}

.report-content {
  font-family: Arial, "Khmer", sans-serif;
  min-height: calc(100vh - 40px);
  background-color: #f8f9fa;
  border-radius: 10px;
}
</style>
