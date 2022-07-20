<template>
  <b-container >
    <h2 class="text-center text-success" style="margin-bottom: 50px;">បញ្ចូលទំនិញក្នុងស្តុក</h2>
    <div class="display-inline-block full-with" v-if="purchase">
      <div class="display-inline-block content-field-purchase float-left" v-if="suppliers && products">
        <p class="text-danger" v-if="suppliers.length === 0 || products.length === 0">
          មិនអាចបញ្ចូលទំនិញក្នុងស្តុកបានទេ ព្រោះ
          <span v-if="suppliers.length === 0">មិនមានបញ្ចូលទិន្នន័យអ្នកផ្គត់ផ្គង់់, </span>
          <span v-if="products.length === 0">មិនមានបញ្ចូលទិន្នន័យទំនិញ, </span>
          សូមបង្កើត
          <span v-if="suppliers.length === 0">ទិន្នន័យអ្នកផ្គត់ផ្គង់់</span>
          <span v-if="products.length === 0">ទិន្នន័យទំនិញ</span>
        </p>
        <div style="margin-bottom: 15px">
          <label class="label-with">{{$t('title_supplier')}}</label>
          <b-form-select :disabled="suppliers.length === 0" class="form-control select-content-inline display-inline-block" v-model="purchase.supplier" :options="suppliers"></b-form-select>
        </div>
        <div class="margin-bottom-20">
          <label class="label-with">{{ $t('title_warehouse') }}</label>
          <b-form-select :disabled="warehouses.length === 0" class="form-control select-content-inline display-inline-block" v-model="purchase.warehouse" :options="warehouses"></b-form-select>
        </div>
        <div class="margin-bottom-20">
          <div class="width-30-percentage display-inline-block"><label class="label-input">បញ្ចូលទំនិញតាមការជ្រើសរើស</label></div>
          <div class="width-68-percentage display-inline-block">
              <multiselect
                v-model="product_select" :options="products"
                track-by="name" label="name" :show-labels="false"
                :placeholder="$t('label_search_by_product')"
                @select="selectedProduct"
                @remove="removeElementProduct">

              </multiselect>
          </div>
        </div>
      </div>
      <div class="display-inline-block content-field-purchase float-right">
        <div class="float-right display-inline-block full-with" style="margin-bottom: 15px" v-if="vats">
          <label class="label-with">ពន្ធ</label>
          <b-form-select class="form-control select-content-inline display-inline-block" v-model="purchase.vat" :options="vats"></b-form-select>
        </div>
        <div class="float-right display-inline-block full-with margin-bottom-20" >
          <label class="label-with">Batch</label>
          <b-form-input class="form-control select-content-inline display-inline-block" v-model="purchase.batch"></b-form-input>
        </div>
      </div>
      <div class="display-inline-block full-with margin-bottom-20" v-if="productItems && productItems.length > 0">
        <b-table class="productItem" style="height: 30vh;"
          sticky-header="true"
          :items="productItems"
          :fields="productFields"
          head-variant="light"
        >
          <template #cell(import_price)="row">
            <b-form-input ref="inputImportPrice" type="number" class="input-content" v-bind:class="'content-input-import_price-'+row.item.id" v-model="row.item.import_price" :autofocus="true"></b-form-input>
          </template>
          <template #cell(sale_price)="row">
            <b-form-input ref="inputSalePrice" type="number" class="input-content" v-bind:class="'content-input-sale_price-'+row.item.id" v-model="row.item.sale_price" :autofocus="true"></b-form-input>
          </template>
          <template #cell(qty)="row">
            <b-form-input ref="inputQty" type="number" class="input-content" v-bind:class="'content-input-qty-'+row.item.id" v-model="row.item.qty" :autofocus="true"></b-form-input>
          </template>
        </b-table>
      </div>
      <div class="display-inline-block full-with" style="margin-top: 25px; padding-right: 15px;">
        <b-button class="float-right"
          href="#" size="sm" variant="danger"
          title="Discard stock" @click="discardPurchase()"
        >
          {{$t('title_discard_add_stock')}}
        </b-button>
        <b-button
                class="float-right" style="margin-right: 20px;"
                v-show="purchase.supplier && purchase.warehouse && this.productItems.length > 0"
                href="#" size="sm" variant="success"
                title="Save stock" @click="submitPurchase()" :disabled="checkingToDisable()">
          {{$t('save_purchase')}}
        </b-button>
      </div>
    </div>
  </b-container>
</template>

<script>
export default {
  props: {
    suppliers: {
      type: Array,
      require: true
    },
    products: {
      type: Array,
      require: false
    },
    warehouses: {
      type: Array,
      require: false
    },
    purchase: {
      type: Object,
      require: false
    },
    items: {
      type: Array,
      require: false
    },
    vats: {
      type: Array,
      require: false
    },
    productList: {
      type: Array,
      require: false
    },
  },
  data() {
    return {
      product_select: null,
      productItems: [],
      productFields: [
        { key: 'en_name', label: this.$t('label_name_english')},
        { key: 'kh_name', label: this.$t('label_name_khmer')},
        { key: 'image', label: this.$t('title_icon') },
        { key: 'code', label: this.$t('title_barcode')},
        { key: 'import_price', label: this.$t('import_price') + ' ($)'},
        { key: 'sale_price', label: this.$t('label_sale_price') + ' ($)'},
        { key: 'qty', label: 'ចំនួន'},
      ],
    }
  },
  methods: {
    submitPurchase(){
      this.$emit("submitPurchase",{purchase: this.purchase, productItems: this.productItems});
    },
    discardPurchase() {
      this.$emit("discardPurchase",{isDiscard: true});
    },
    adjustProductAdd(item){

    },
    showRemoveProductSelect(item){

    },
    selectedProduct($obj){
      if($obj && $obj.hasOwnProperty("value")){
        let items = this.cloneObject(this.productItems);
        let productItem = {};
        productItem = this.productList.find(item => item.id === $obj.value);

        if(items && items > 0){
          let dataItem = this.productItems.find(item => item.id === $obj.value);
          let index = this.productItems.indexOf(dataItem);
          if(dataItem && dataItem.hasOwnProperty("id")){
            if(items[index].hasOwnProperty("qty") && parseInt(items[index]["qty"]) > 0 && parseInt(items[index]["qty"]) > 1){
              items[index]["qty"] = (parseInt(items[index]["qty"]) + parseInt(productItem.qty));
            }
            else if(items[index].hasOwnProperty("qty") && (parseInt(items[index]["qty"]) === 0 || parseInt(items[index]["qty"]) ===1)){
              items[index]["qty"] = (parseInt(items[index]["qty"]) + 1);
            }
          }
          else {
            items.unshift(productItem);
          }
        }
        else {
          items.unshift(productItem);
        }
        this.productItems = this.cloneObject(items);
        console.log(this.productItems);
      }
      this.$forceUpdate();
    },
    checkingToDisable(){
      let countInputQty = 0;
      let countInputPrice = 0;
      let shouldBeDisable = false;
      if(this.productItems && this.productItems.length > 0){
        for (let i=0; i< this.productItems.length; i++){
          if(this.productItems[i] && this.productItems[i].hasOwnProperty("qty") && this.productItems[i]["qty"] > 0){
            countInputQty = (countInputQty + 1);
          }
          if(this.productItems[i] && this.productItems[i].hasOwnProperty("import_price") && this.productItems[i]["import_price"] > 0){
            countInputPrice = (countInputPrice + 1);
          }
        }
        shouldBeDisable = (countInputQty < this.productItems.length || countInputPrice < this.productItems.length);
      }
      console.log(shouldBeDisable);
      return shouldBeDisable;
    },
    removeElementProduct(){
      this.$forceUpdate();
    },
    addProductToListPurchase(){

    },

    cloneObject(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
  },

}
</script>

