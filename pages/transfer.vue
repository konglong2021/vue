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
                    <div style="display: inline-block; overflow: hidden; margin-right: 10px;">
                      <div class="form-column-label" style="vertical-align: text-bottom; width: 155px;">ស្វែងរកទិន្នន័យតាមថ្ងៃ : </div>
                      <div class="form-column-input width-50-percentage" style="vertical-align: text-bottom;">
                        <b-form-input type="date" v-model="dateFilter" v-on:change="changeFilterDate(dateFilter)"></b-form-input>
                      </div>
                    </div>
                    <div class="btn-wrapper">
                      <b-button style="padding: 7px 10px;" href="#" title="Add new Transfer" size="sm" variant="primary" @click="addTransferStock()">
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
              <div class="content-loading" v-if="isLoading">
                <div class="spinner-grow text-muted"></div>
              </div>
              <div v-if="!isLoading">
                <transfer-stock isLoading:="isLoading" :listStockOut="listDataStockOut" v-model="stockTransfer" :warehouseOption="warehouseOption" :products="productListOptionForTransfer" :productList="productListForTransfer"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-row>
  </b-container>
</template>

<script>
import moment from "moment";

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
      isLoading: false,
      dateFilter : null,
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

      await self.$axios.post('/api/stockbywarehouse', {warehouse : self.$store.$cookies.get('storeItem'), pagination: false})
      .then(function (response) {
        if(response && response.hasOwnProperty("data")){
          let dataResponse = response.data;
          if(dataResponse && dataResponse.length > 0){
            self.totalRows = response.data.length;

            for(let i=0; i < dataResponse.length; i++){
              if(dataResponse[i].hasOwnProperty("product_id") && dataResponse[i].product_id){
                let productOptionItem =  { name: '', value: null};
                productOptionItem.name = (dataResponse[i].en_name + " - " + dataResponse[i].kh_name + " (" + dataResponse[i].code + ")");
                productOptionItem.value = dataResponse[i].product_id;
                self.productListForTransfer.unshift(dataResponse[i]);
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
    async getAllDataStockOut($dateFilter = null){
      let self = this;
      self.isLoading = true;
      self.listDataStockOut = [];
      if(!$dateFilter){
        await self.$axios.get('/api/groupStockOut').then(function (response) {
          self.isLoading = false;
          if(response && response.hasOwnProperty("data") && response.data){
            let data = response["data"];
            if(data && data.length > 0){
              for(let index=0; index < data.length; index++){
                let item = data[index];
                let dataItem = {warehouse_from: null, warehouse_to: null, ref: null};
                let date = "";
                if(item && item.created_at){
                  date = moment(item.created_at, "YYYY-MM-DD").format("DD/MM/YYYY").toString();
                }
                dataItem.warehouse_from = item.from_warehouse.name + " (" + item.from_warehouse.address + ") ";
                dataItem.warehouse_to = item.to_warehouse.name + " (" + item.to_warehouse.address + ") ";
                dataItem.ref = item.ref;
                dataItem["date"] = date;
                self.listDataStockOut.push(dataItem);
              }
            }
          }
        }).catch(function (error) {
          console.log(error);
          self.$toast.error("Getting data error").goAway(3000);
        });
      }
      else {
        await self.$axios.get('/api/stockout/' + $dateFilter).then(function (response) {
          self.isLoading = false;
          console.log(response);

          if(response && response.hasOwnProperty("data") && response.data){
            let data = response["data"];
            let dataArray = Object.keys(data).map(key => {
              return data[key];
            });

            if(dataArray && dataArray.length > 0){
              for(let index=0; index < dataArray.length; index++){
                let item = dataArray[index];
                let dataItem = {warehouse_from: null, warehouse_to: null, product: null, quantity: 0, ref: null};
                let date = "";
                if(item && item.created_at){
                  date = moment(item.created_at, "YYYY-MM-DD").format("DD/MM/YYYY").toString();
                }

                dataItem.warehouse_from = item.from_warehouse.name + " (" + item.from_warehouse.address + ") ";
                dataItem.warehouse_to = item.to_warehouse.name + " (" + item.to_warehouse.address + ") ";
                dataItem.product = item.product.en_name + " - " + item.product.kh_name + "( " + item.product.code + ") ";
                dataItem.ref = item.ref;
                dataItem.quantity = parseInt(item.quantity);
                dataItem["date"] = date;
                self.listDataStockOut.push(dataItem);
              }
            }
          }
        }).catch(function (error) {
          console.log(error);
          self.$toast.error("Getting data error").goAway(3000);
        });
      }
    },
    searchProduct(){

    },
    handleClick(e) {
      if (e.target.value === '' || e.target.value === null || e.target.value === undefined) {
        this.searchInput = '';
        this.getAllDataStockOut();
      }
    },
    changeFilterDate(filterDate){
      this.getAllDataStockOut(filterDate);
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
