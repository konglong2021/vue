<template >
  <div class="display-inline-block full-with">
    <div class="display-inline-block full-with" v-if="showContent === true">
      <div class="container" >
        <b-form enctype="multipart/form-data">
          <h2 class="text-center margin-bottom-50">ផ្ទេរឥវ៉ាន់</h2>
          <div class="full-content">
            <div class="row margin-bottom-20">
              <div class="display-inline-block width-50-percentage float-left">
                <b-col class="width-35-percentage display-inline-block"><label class="label-input">ឃ្លាំងចាស់</label></b-col>
                <b-col class="width-63-percentage display-inline-block ">
                  <b-form-select type="text" class="input-content font-size-14" :options="warehouseOption" v-model="transfer.from_warehouse" required></b-form-select>
                </b-col>
              </div>
              <div class="display-inline-block width-49-percentage float-left">
                <b-col class="width-35-percentage display-inline-block"><label class="label-input">ឃ្លាំងផ្ទេរទៅកាន់</label></b-col>
                <b-col class="width-63-percentage display-inline-block">
                  <b-form-select type="text" class="input-content font-size-14" :options="warehouseOption" v-model="transfer.to_warehouse" required></b-form-select>
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
                <template #cell(actions)="row">
                  <b-button size="md" class="btn-no-background-danger" @click="removeProductFromListOfTransfer(row.item,  $event.target)">
                    <i class="fa fa-trash"></i>
                  </b-button>
                </template>
              </b-table>
            </div>
            <div class="display-inline-block full-with" style="margin-top: 25px; padding-right: 15px;">
              <b-button class="float-right" href="#" size="md" variant="danger" title="Transfer product to new stock" @click="hideTransferStock()">
                <span class="margin-span-btn">បោះបង់</span>
              </b-button>
              <b-button
                v-show="checkingToDisable() === true"
                class="float-right disabled" style="margin-right: 15px;" href="#" size="md"
                title="Transfer product to new stock"
              >
                <span class="margin-span-btn">រក្សារទុក</span>
              </b-button>
              <b-button v-show="checkingToDisable() === false"
                class="float-right" style="margin-right: 15px;" href="#" size="md"
                variant="primary" title="Transfer product to new stock"
                @click="submitTransferStock()"
              >
                <span class="margin-span-btn">រក្សារទុក</span>
              </b-button>
            </div>
          </div>
        </b-form>
      </div>
    </div>
    <div v-else-if="showContent === false">
      <div v-if="listStockOut">
        <div v-if="listStockOut.length > 0">
          <b-table
            class="content-table-scroll"
            sticky-header="true"
            :items="listStockOut"
            :fields="listStockOutFields"
            head-variant="light"
          >
            <template #cell(actions)="row">
              <b-button v-can="'pos_access'" size="sm" title="View data" class="btn-no-background" @click="viewDataDetail(row.item)">
                <i class="fa fa-eye"></i>
              </b-button>
            </template>
          </b-table>
        </div>
        <div v-if="listStockOut.length === 0"><h2 class="text-center color-info">មិនមានទិន្នន័យទេ</h2></div>
        <b-modal id="modal-detail-transfer" ref="modal-detail-transfer" size="lg" modal-class="payment-form-modal"
                 ok-only ok-variant="secondary" footer-class="justify-content-center"
                ok-title="បិទ" title="ពត៍មានការផ្ទេរទំនិញ" no-close-on-backdrop>
          <b-form enctype="multipart/form-data" style="display: inline-block; width: 100%; height: 100%; overflow: hidden;">
            <div class="full-content margin-bottom-20">
              <div class="container-row-form width-60-percentage float-left">
                <div class="form-row-content-detail row-content-view">
                  <label :for="'input-exchange-rate'" class="label-input no-margin-bottom" style="width: 105px; font-family: 'Arial', 'Khmer OS Bokor', sans-serif;">ថ្ងៃខែផ្ទេរ : </label>
                  <strong class="input-content" style="font-family: 'Arial', 'Khmer OS Bokor', sans-serif;"> {{ transferItemDetail.date }}</strong>
                </div>
                <div class="form-row-content-detail row-content-view">
                  <label :for="'input-exchange-rate'" class="label-input no-margin-bottom" style="width: 105px; font-family: 'Arial', 'Khmer OS Bokor', sans-serif;">Reference : </label>
                  <strong class="input-content" style="font-family: 'Arial', 'Khmer OS Bokor', sans-serif;"> {{ transferItemDetail.ref }}</strong>
                </div>
              </div>
              <div class="container-row-form width-29-percentage float-right">
                <div class="form-row-content-detail row-content-view">
                  <label :for="'input-discount'" class="label-input no-margin-bottom" style="width: 105px; font-family: 'Arial', 'Khmer OS Bokor', sans-serif;">ឃ្លាំងចាស់ : </label>
                  <strong class="input-content" style="font-family: 'Arial', 'Khmer OS Bokor', sans-serif;"> {{ transferItemDetail.warehouse_from }}</strong>
                </div>
                <div class="form-row-content-detail row-content-view">
                  <label :for="'input-vat'" class="label-input no-margin-bottom" style="width: 105px; font-family: 'Arial', 'Khmer OS Bokor', sans-serif;">ឃ្លាំងផ្ទេរទៅកាន់ : </label>
                  <strong class="input-content" style="font-family: 'Arial', 'Khmer OS Bokor', sans-serif;"> {{ transferItemDetail.warehouse_to }}</strong>
                </div>
              </div>
            </div>
            <b-table class="table table-striped table-bordered table-payment scroll-table-content" responsive style="z-index: 1;"
                     sticky-header="true"
                     :items="itemsProductDetail"
                     :fields="fieldsProductDetail"
                     head-variant="light"
            >
            </b-table>
          </b-form>
        </b-modal>
      </div>
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
    isLoading: {
      type: Boolean,
      require:false
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
          console.log(this.listStockOut);
        }
      },
      deep: true,
    },
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
        { key: 'total', label: "ចំនួនក្នុងស្តុក"},
        { key: 'qty', label: 'ចំនួន'},
        { key: 'actions', label: this.$t('title_action') }
      ],
      listStockOutFields: [
        { key: 'date', label: 'ថ្ងៃខែផ្ទេរ'},
        { key: 'warehouse_from', label: 'ឃ្លាំងចាស់'},
        { key: 'warehouse_to', label: 'ឃ្លាំងផ្ទេរទៅកាន់'},
        { key: 'ref', label: ' Reference'},
        { key: 'actions', label: this.$t('title_action')},

      ],
      transfer: {
        from_warehouse: null,
        to_warehouse: null,
        product_id: null,
        quantity: 0,
        ref: null
      },
      items: [],
      itemsProductDetail: [],
      transferItemDetail: {},
      fieldsProductDetail: [
        { key: 'number', label: 'លេខរៀង', thClass: "header-th", thStyle : "font-size: 17px;"},
        { key: 'product', label: 'ឈ្មោះទំនិញ', thClass: "header-th", thStyle : "font-size: 17px;"},
        { key: 'qty', label: 'ចំនួន', thClass: "header-th", thStyle : "font-size: 17px; width: 15%;"},
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
    selectedProduct($obj){
      let productItem = this.productList.find(item => item.product_id === $obj.value);
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
          let newItem = {from_warehouse: null, to_warehouse: null, product_id: null, quantity: 0, ref: null};

          newItem.from_warehouse = self.transfer.from_warehouse;
          newItem.to_warehouse = self.transfer.to_warehouse;
          if(self.transfer.ref){
            newItem.ref = self.transfer.ref;
          }

          let productId = self.productItems[index].product_id;
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
            self.transfer = {
              from_warehouse: null,
                to_warehouse: null,
                product_id: null,
                quantity: 0,
                ref: null
            };
            self.product_select = null;
            self.productItems = [];
            self.$toast.success("Submit data successfully").goAway(2000);
          }
        }).catch(function (error) {
          self.$toast.error("getting data error ").goAway(2000);
          console.log(error);
        });
      }
    },
    changeFilterDate(filterDate){
      this.$emit("changeFilterDate", {filterDate: filterDate});
    },
    async viewDataDetail(item){
      let self = this;
      this.transferItemDetail = item;
      this.itemsProductDetail = [];
      let dataDetailArray = [];
      if(item.hasOwnProperty("ref")){
        await self.$axios.post('/api/groupStockOut' ,{ref: item.ref} ).then(function (response) {
          if(response && response.hasOwnProperty("data") && response.data){
            if(response.data.length > 0){
              let index = 0;
              for (let itemDetail of response.data){
                let data = {number: 0, product: null, qty: 0};
                let productItem = self.productList.find(item => item.product_id === itemDetail["product_id"]);
                data.number = (index + 1);
                data.product = (productItem["en_name"] + " " + productItem["kh_name"]);
                data.qty = parseInt(itemDetail["quantity"]);
                dataDetailArray.push(data);
                index++;
              }
            }
            self.itemsProductDetail = self.cloneObject(dataDetailArray);
          }
        }).catch(function (error) {
          self.$toast.error("getting data error ").goAway(2000);
          console.log(error);
        });
      }
      this.$nextTick(() => {
        this.$refs["modal-detail-transfer"].show();
      });
    },
    cloneObject(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    removeProductFromListOfTransfer(item, $eventTarget){
      let productFound = this.productItems.find(productItem => productItem.id === item.id);
      let index = this.productItems.indexOf(productFound);
      if(index > -1){
        this.productItems.splice(index, 1);
      }
    },
    checkingToDisable(){
      let countInputQty = 0;
      let shouldBeDisable = false;
      if(this.productItems && this.productItems.length > 0){
        for (let i=0; i< this.productItems.length; i++){
          if(this.productItems[i] && this.productItems[i].hasOwnProperty("qty") && this.productItems[i]["qty"] > 0){
            countInputQty = (countInputQty + 1);
          }
        }
      }
      return (
        countInputQty < this.productItems.length
        ||
        (
          this.transfer
          && (
            !this.transfer.hasOwnProperty("ref")
            ||
            (
              this.transfer.hasOwnProperty("ref") && this.transfer["ref"] === null)
            ||
            (this.transfer.hasOwnProperty("ref") && this.transfer["ref"] === "")
          )
        )
        ||
        (!this.transfer.hasOwnProperty("from_warehouse") || (this.transfer.hasOwnProperty("from_warehouse") && this.transfer.from_warehouse === null))
        ||
        (!this.transfer.hasOwnProperty("to_warehouse")|| (this.transfer.hasOwnProperty("to_warehouse") && this.transfer.to_warehouse === null))
      );
    },
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
  .cursor-not-allow{
    cursor: not-allowed !important;
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
