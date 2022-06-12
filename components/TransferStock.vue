<template >
  <div class="display-inline-block full-with " v-show="showContent === true">
    <div class="container" >
      <b-form enctype="multipart/form-data">
        <h2 class="text-center margin-bottom-50">ផ្ទេរឥវ៉ាន់</h2>
        <div class="full-content">
          <div class="row margin-bottom-20">
            <div class="display-inline-block width-50-percentage float-left">
              <b-col class="width-25-percentage display-inline-block"><label class="label-input">ឃ្លាំងចាស់</label></b-col>
              <b-col class="width-74-percentage display-inline-block">
                <b-form-select type="text" class="input-content" :options="warehouseOption" required></b-form-select>
              </b-col>
            </div>
            <div class="display-inline-block width-49-percentage float-left">
              <b-col class="width-25-percentage display-inline-block"><label class="label-input">ឃ្លាំងផ្ទេរទៅកាន់</label></b-col>
              <b-col class="width-74-percentage display-inline-block">
                <b-form-select type="text" class="input-content" :options="warehouseOption" required></b-form-select>
              </b-col>
            </div>
          </div>
          <div class="row">
            <div class="display-inline-block width-50-percentage float-left">
              <b-col class="width-25-percentage display-inline-block"><label class="label-input">ទំនិញ</label></b-col>
              <b-col class="width-74-percentage display-inline-block">
                <multiselect
                  v-model="product_select" :options="products"
                  track-by="name" label="name" :show-labels="false"
                  :placeholder="$t('label_search_by_product')"
                  @select="selectedProduct"
                  @remove="removeElementProduct"></multiselect>
              </b-col>
            </div>
            <div class="display-inline-block width-49-percentage float-left">
              <b-col class="width-25-percentage display-inline-block"><label class="label-input">Reference</label></b-col>
              <b-col class="width-74-percentage display-inline-block">
                <b-form-input type="text" class="input-content" required></b-form-input>
              </b-col>
            </div>

            <div class="display-inline-block width-29-percentage float-right" style="padding-left: 15px; display: none">
              <b-button class="float-left min-height-40-px" href="#" size="sm" variant="success" title="Add product to list" @click="addProductToListTransfer()">
                <i class="fa fa-plus font-size-22" aria-hidden="true"></i>
                <span class="margin-span-btn">បញ្ចូលទំនិញផ្ទេរទៅក្នុងតារាង</span>
              </b-button>
            </div>
          </div>
          <div class="display-inline-block full-with" v-if="stockItems && stockItems.length > 0">
            <b-table
              class="content-table-scroll"
              sticky-header="true"
              :items="stockItems"
              :fields="stockFields"
              head-variant="light"
            ></b-table>
          </div>
          <div class="display-inline-block full-with" style="margin-top: 25px; padding-right: 15px;">
            <b-button class="float-right" href="#" size="lg" variant="primary" title="Transfer product to new stock" @click="hideTransferStock()">
              <i class="fa fa-truck" aria-hidden="true"></i>
              <span class="margin-span-btn">បោះបង់ការផ្ទេរឥវ៉ាន់</span>
            </b-button>
          </div>
        </div>
      </b-form>
    </div>
  </div>
</template>

<script>
export default {
  props:{
    'value':{
      type:Object,
      require:true
    },
    warehouseOption: {
      type:Array,
      require:false
    },
    products: {
      type:Array,
      require:false
    },
  },

  watch: {
    'value.show': {
      handler(value){
        if(value === true){
          this.showContent = value;
        }
      },
      deep: true,
    }
  },

  data() {
    return {
      showContent: false,
      product_select: null,
      stockItems : [],
      stockFields: [
        { key: 'en_name', label: this.$t('label_name_english')},
        { key: 'kh_name', label: this.$t('label_name_khmer')},
        { key: 'image', label: this.$t('title_icon') },
        { key: 'code', label: this.$t('title_barcode')},
        { key: 'sale_price', label: this.$t('label_sale_price') + ' ($)'},
        { key: 'product_qty', label: this.$t('title_label_total_stock')},
        { key: 'store', label: this.$t('title_store'), tdClass: "col-sm-3" },
      ],
    }
  },
  methods: {
    hideTransferStock(){
      this.value.show = false;
      this.showContent = false;
    },
    addProductToListTransfer(){

    },
    selectedProduct(){
      this.$forceUpdate();
    },
    removeElementProduct(){
      this.$forceUpdate();
    }
  },
  mounted() {
  }
}
</script>

<style>
  .container-form{
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
  }
  .width-70-percentage{
    width: 70% !important;
  }
  @media (min-width: 1200px){
    .container-form {
      max-width: 1140px;
    }
  }

</style>
