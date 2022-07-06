<template>
  <div class="display-inline-block full-with">
    <div>
      <div class="content-loading" v-if="isLoading">
        <div class="spinner-grow text-muted"></div>
      </div>
    </div>
    <div v-if="!isLoading">
      <div class="display-inline-block full-with margin-bottom-20">
        <h3 class="float-right">សរុប: {{ calculate(orderItems) }}</h3>
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
    isLoading: {
      type: Boolean,
      require: false
    }
  },
  data() {
    return {
    }
  },
  watch:{
  },
  methods: {
    calculate($list){
      let totalSales = [];

      Object.entries($list).forEach(([key, val]) => {
        if(val.total_after_discount){
          totalSales.push(parseFloat(val.total_after_discount));
        }
      });
      return  totalSales.reduce(function(total, num) {
          return parseFloat((parseFloat(total) + parseFloat(num)).toFixed(2)) }
        , 0);
    }
  },

  mounted() {
  }
}
</script>
