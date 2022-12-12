<template>
  <b-container fluid class="bv-example-row main-page-content">
    <InventoryDashboard/>
  </b-container>
</template>
<script>
  export default {
    middleware: "local-auth",
    layout:'inventoryui'
  }
</script>

<style scoped>
.main-page-content{
  /*min-height: calc(100vh - 95px);*/
  min-height: calc(100% - 75px);
}
</style>
