<template >
  <div class="display-inline-block full-with " v-if="showContent === true">
    <div class="container" >
      <b-form enctype="multipart/form-data">
        <h2 class="text-center margin-bottom-50">ផ្ទេរឥវ៉ាន់</h2>
        <div class="full-content">
          <div class="row margin-bottom-20">
            <div class="display-inline-block width-50-percentage float-left">
              <b-col class="width-35-percentage display-inline-block"><label class="label-input">ឃ្លាំងចាស់</label></b-col>
              <b-col class="width-63-percentage display-inline-block">
                <b-form-select type="text" class="input-content" :options="warehouseOption" v-model="transfer.from_warehouse" required></b-form-select>
              </b-col>
            </div>
            <div class="display-inline-block width-49-percentage float-left">
              <b-col class="width-35-percentage display-inline-block"><label class="label-input">ឃ្លាំងផ្ទេរទៅកាន់</label></b-col>
              <b-col class="width-63-percentage display-inline-block">
                <b-form-select type="text" class="input-content" :options="warehouseOption" v-model="transfer.to_warehouse" required></b-form-select>
              </b-col>
            </div>
          </div>
          <div class="row margin-bottom-20">
            <div class="display-inline-block width-50-percentage float-left">
              <b-col class="width-35-percentage display-inline-block"><label class="label-input">ទំនិញ</label></b-col>
              <b-col class="width-63-percentage display-inline-block">
                <multiselect
                  v-model="product_select" :options="products"
                  track-by="name" label="name" :show-labels="false"
                  :placeholder="$t('label_search_by_product')"
                  @select="selectedProduct"
                  @remove="removeElementProduct"></multiselect>
              </b-col>
            </div>
            <div class="display-inline-block width-49-percentage float-left">
              <b-col class="width-35-percentage display-inline-block"><label class="label-input">Reference</label></b-col>
              <b-col class="width-63-percentage display-inline-block">
                <b-form-input type="text" class="input-content" v-model="transfer.ref" required></b-form-input>
              </b-col>
            </div>

            <div class="display-inline-block width-29-percentage float-right" style="padding-left: 15px; display: none">
              <b-button class="float-left" href="#" size="sm" variant="success" title="Add product to list" @click="addProductToListTransfer()">
                <i class="fa fa-plus font-size-22" aria-hidden="true"></i>
                <span class="margin-span-btn">បញ្ចូលទំនិញផ្ទេរទៅក្នុងតារាង</span>
              </b-button>
            </div>
          </div>
          <div class="display-inline-block full-with margin-bottom-20" v-if="productItems && productItems.length > 0">
            <b-table
              class="content-table-scroll"
              sticky-header="true"
              :items="productItems"
              :fields="productFields"
              head-variant="light"
            >
              <template #cell(qty)="row">
                <b-form-input ref="inputQty" type="number" class="input-content" v-bind:class="'content-input-qty-'+row.item.id" v-model="row.item.qty" :autofocus="true"></b-form-input>
              </template>
            </b-table>
          </div>
          <div class="display-inline-block full-with" style="margin-top: 25px; padding-right: 15px;">
            <b-button class="float-right" href="#" size="md" variant="danger" title="Transfer product to new stock" @click="hideTransferStock()">
<!--              <i class="fa fa-truck" aria-hidden="true"></i>-->
              <span class="margin-span-btn">បោះបង់</span>
            </b-button>
            <b-button class="float-right" style="margin-right: 15px;" href="#" size="md" variant="primary" title="Transfer product to new stock" @click="submitTransferStock()">
<!--              <i class="fa fa-truck" aria-hidden="true"></i>-->
              <span class="margin-span-btn">រក្សារទុក</span>
            </b-button>
          </div>
        </div>
      </b-form>
    </div>
  </div>
  <div v-else-if="!showContent">
    <div v-if="listStockOut && listStockOut.length > 0">
      <b-table
        class="content-table-scroll"
        sticky-header="true"
        :items="listStockOut"
        :fields="listStockOutFields"
        head-variant="light"
      ></b-table>
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
    productList: {
      type:Array,
      require:false
    },
    listStockOut:{
      type:Array,
      require:false
    }
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
      productItems : [],
      productFields: [
        { key: 'en_name', label: this.$t('label_name_english')},
        { key: 'kh_name', label: this.$t('label_name_khmer')},
        { key: 'image', label: this.$t('title_icon') },
        { key: 'code', label: this.$t('title_barcode')},
        { key: 'sale_price', label: this.$t('label_sale_price') + ' ($)'},
        { key: 'qty', label: 'ចំនួន'},
      ],
      listStockOutFields: [
        { key: 'warehouse_from', label: 'ឃ្លាំងចាស់'},
        { key: 'warehouse_to', label: 'ឃ្លាំងផ្ទេរទៅកាន់'},
        { key: 'product', label: this.$t('label_product_name') },
        { key: 'ref', label: ' Reference'},
        { key: 'quantity', label: this.$t('label_quantity')},
      ],
      transfer: {
        from_warehouse: null,
        to_warehouse: null,
        product_id: null,
        quantity: 0,
        ref: null
      },
    }
  },
  methods: {
    hideTransferStock(){
      this.value.show = false;
      this.showContent = false;
    },
    addProductToListTransfer(){

    },
    selectedProduct($obj){
      let productItem = this.productList.find(item => item.id === $obj.value);
      this.productItems.push(productItem);
      this.$forceUpdate();
    },
    removeElementProduct(){
      this.$forceUpdate();
    },
    async submitTransferStock(){
      let self = this;
      let dataSubmit = [];

      if(self.productItems && self.productItems.length > 0){
        for (let index=0; index < self.productItems.length; index++){
          let newItem = {from_warehouse: null, to_warehouse: null, product_id: null, quantity: 0};

          newItem.from_warehouse = self.transfer.from_warehouse;
          newItem.to_warehouse = self.transfer.to_warehouse;
          if(self.transfer.ref){
            newItem.ref = self.transfer.ref;
          }

          let productId = self.productItems[index].id;
          let qty = parseInt(self.productItems[index].qty);

          newItem.product_id = productId;
          newItem.quantity = qty;
          dataSubmit.push(newItem);
        }
      }
      if(dataSubmit && dataSubmit.length > 0){
        self.$toast.info("Data starting submit").goAway(1500);
        await self.$axios.post('/api/stock', {items: dataSubmit}).then(function (response) {
          if(response && response.hasOwnProperty("data") && response.data && response.data.success === true){
            self.value.show = false;
            self.showContent = false;
            self.$toast.success("Submit data successfully").goAway(2000);
          }
        }).catch(function (error) {
          self.$toast.error("getting data error ").goAway(2000);
          console.log(error);
        });
      }
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

  @media (min-width: 768px){
    .container-form {
      max-width: 810px;
    }
  }

</style>
