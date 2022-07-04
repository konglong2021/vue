<template>
  <div>
    <div style="display:none;">
      <b-table v-if="items.length > 0" striped hover :items="items" :fields="fields"></b-table>
      <h4 style="display: none; font-weight: 900;">ទឹកប្រាក់សរុបប្រចាំថ្ងៃ : {{calculate(items) + "($)"}}</h4>
      <h3 v-if="items.length === 0" class="text-center">មិនមានទិន្នន័យសម្រាប់ថ្ងៃនេះទេ</h3>
    </div>
    <div>
      <b-tabs
        active-nav-item-class="active-tab"
        content-class="mt-3">
        <b-tab title="ការលក់" active>
          <sale-daily-report :warehouse="warehouse" />
        </b-tab>
        <b-tab title="នាំចូលទំនិញ">
          <p>I'm the Purchase tab</p>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    warehouse: {
      type: String,
      require: true
    },
    items: {
      type: false,
      require: false
    },
    fields: {
      type: Array,
      require: false
    },
  },
  data() {
    return {}
  },
  methods: {
    calculate(items){
      let total = [];
      Object.entries(items).forEach(([key, val]) => {
        total.push(val.grandtotal ? parseFloat(val.grandtotal) : 0) ;
      });
      return total.reduce(function(total, num){ return total + num }, 0);
    },
  }
}
</script>

<style scoped>
.active-tab{
  border-color: transparent;
  border-bottom: 2px solid #7c5cc4;
}
</style>
