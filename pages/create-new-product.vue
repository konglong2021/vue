<template>
  <b-container fluid class="bv-example-row">
    <b-row>
        <AddNewProduct/>
    </b-row>
  </b-container>
</template>
<script>
  export default {
    middleware: "local-auth",
    layout:'inventoryui'
  }
</script>

