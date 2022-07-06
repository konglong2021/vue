<template>
  <div class="display-inline-block full-with">
    <div class="display-inline-block full-with margin-bottom-20">
      <h3 class="float-right">សរុប: </h3>
    </div>
    <div class="d-flex align-items-center">
        <div class="table-responsive">
          <b-table class="productItem" style="height: calc(100vh - 70px) !important;"
            sticky-header="true"
            :items="orderItems"
            :fields="fieldsProductDetail"
            head-variant="light"
          ></b-table>
        </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";

export default {
  props: {
    warehouse: {
      type: String,
      require: true
    },
    orderItems: {
      type: false,
      require: false
    },
    fieldsProductDetail: {
      type: Array,
      require: false
    },

  },
  data() {
    return {
    }
  },
  watch:{

  },
  methods: {
  },

  mounted() {
  }
}
</script>
