<template>
  <b-container fluid class="bv-example-row main-page-content">
    <b-row>
      <div class="inventory-dashboard-content main-page-content">
        <div class="full-content">
          <div class="control-panel">
            <div class="panel-top">
              <div class="content-panel-left">
                <h3 class="head-title"> {{ $t('stock_transfer')}}</h3>
              </div>
              <div class="content-panel-right">
                <b-container class="col-6 mx-auto menu-wrapper">
                  <b-row>
                    <b-col>
                      <div class="input-group input-group-sm search-content" style="display: none">
                        <span class="input-group-addon button-search-box"><i class="fa fa-search"></i></span>
                        <input class="form-control input-search-box" type="search" placeholder="Search..." v-model="searchInput" @keyup.enter="searchProduct()" @change="handleClick" />
                      </div>
                    </b-col>
                    <div class="btn-wrapper">
                      <b-button href="#"  title="Add new Transfer" size="sm" variant="primary" @click="addTransferStock()">
                        <i class="fa fa-truck" aria-hidden="true"></i>
                        <span class="margin-span-btn">{{ 'បន្ថែម' + $t('stock_transfer')}}</span>
                      </b-button>
                    </div>

                  </b-row>
                </b-container>
              </div>
              <div class="panel-bottom"></div>
            </div>
          </div>
          <div class="content-product">
            <div class="content-data">
              <transfer-stock :listStockOut="listDataStockOut" v-model="stockTransfer" :warehouseOption="warehouseOption" :products="productListOptionForTransfer" :productList="productListForTransfer"/>
            </div>
          </div>
        </div>
      </div>
    </b-row>
  </b-container>
</template>

<script>
export default {
  middleware: "local-auth",
  layout:'inventoryui',
  data(){
    return{
      stockTransfer: { show:false },
      warehouseOption: [],
      productListOptionForTransfer: [],
      productListForTransfer: [],
      listDataStockOut: [],
      searchInput : null,
    }
  },
  methods: {
    addTransferStock(){
      this.stockTransfer.show = true;
    },
    async getAllWarehouse(){
      let vm = this;
      vm.warehouseList = [];
      vm.warehouses = [];

      await vm.$axios.get('/api/warehouse').then(function (response) {
        if(response && response.hasOwnProperty("data")){
          if(response.data.data){
            let data = response.data.data;
            for(let index=0; index < data.length; index++){
              let warehouseItem =  { text: '', value: null};
              warehouseItem.text = data[index]["name"] + "(" + data[index]["address"] + ")";
              warehouseItem.value = data[index]["id"];
              vm.warehouses.unshift(warehouseItem);
              vm.warehouseList.unshift(data[index]);
              vm.warehouseOption.push({text: (data[index]["name"] + " " + data[index]["address"]), value: data[index]["id"]});
            }
          }
        }
      }).catch(function (error) {
        console.log(error);
        vm.$toast.error("Getting data error").goAway(3000);
      });
    },
    async getListProductForTransferStock($warehouse){
      let self = this;
      self.productListForTransfer = [];
      self.productListOptionForTransfer = [];

      await self.$axios.get('/api/stockbywarehouse/' + ($warehouse ? $warehouse : self.$store.$cookies.get('storeItem'))).then(function (response) {
        if(response && response.hasOwnProperty("data")){
          let dataResponse = response.data;
          if(dataResponse && dataResponse.length > 0){
            self.totalRows = response.data.length;

            for(let i=0; i < dataResponse.length; i++){
              let productList = dataResponse[i].product;
              if(productList && productList.length > 0){
                for(let index=0; index < productList.length; index++){
                  let productOptionItem =  { name: '', value: null};
                  productOptionItem.name = (productList[index].en_name + " - " + productList[index].kh_name + " (" + productList[index].code + ")");
                  productOptionItem.value = productList[index].id;

                  self.productListForTransfer.unshift(productList[index]);
                  self.productListOptionForTransfer.unshift(productOptionItem);
                }
              }
              else if(productList && productList.hasOwnProperty("id")){
                let productOptionItem =  { name: '', value: null};
                productOptionItem.name = (productList.en_name + " - " + productList.kh_name + " (" + productList.code + ")");
                productOptionItem.value = productList.id;

                self.productListForTransfer.unshift(productList);
                self.productListOptionForTransfer.unshift(productOptionItem);
              }
            }
          }
        }
      }).catch(function (error) {
        console.log(error);
        self.$toast.error("getting data error ").goAway(2000);
      });
    },
    async getAllDataStockOut(){
      let self = this;
      self.listDataStockOut = [];

      await self.$axios.get('/api/stockout').then(function (response) {
        if(response && response.hasOwnProperty("data") && response.data){
          for(let index=0; index < response.data.length; index++){
            let item = response.data[index];
            let dataItem = {warehouse_from: null, warehouse_to: null, product: null, quantity: 0, ref: null};
            dataItem.warehouse_from = item.from_warehouse.name + " (" + item.from_warehouse.address + ") ";
            dataItem.warehouse_to = item.to_warehouse.name + " (" + item.to_warehouse.address + ") ";
            dataItem.product = item.product.en_name + " - " + item.product.kh_name + "( " + item.product.code + ") ";
            dataItem.ref = item.ref;
            dataItem.quantity = parseInt(item.quantity);
            self.listDataStockOut.push(dataItem);
          }

          console.log(self.listDataStockOut);
        }
      }).catch(function (error) {
        console.log(error);
        self.$toast.error("Getting data error").goAway(3000);
      });
    },
    searchProduct(){

    },
    handleClick(e) {
      if (e.target.value === '' || e.target.value === null || e.target.value === undefined) {
        this.searchInput = '';
        this.getAllDataStockOut();
      }
    },
  },
  mounted() {
    this.getAllWarehouse();
    this.getListProductForTransferStock();
    this.getAllDataStockOut();
  }
}
</script>

<style>

</style>
