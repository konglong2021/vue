<template>
    <div id="pos-product-list" v-show="cashBalance">
      <div class="control-panel">
        <div class="panel-top">
          <div class="content-panel-right content-panel-right-full-width">
            <b-container class="col-12 mx-auto menu-wrapper">
              <b-row>
                <b-col sm="6">
                  <div class="input-group input-group-sm search-content">
                    <span class="input-group-addon button-search-box"><i class="fa fa-search"></i></span>
                    <input
                      class="form-control input-search-box" type="search" placeholder="ស្វែងរកទំនិញ..."
                      v-model="searchInput" @keyup.enter="searchProduct()"
                      @change="handleClick" v-inputTextUppercase
                    />
                  </div>
                </b-col>
                <b-col sm="6" v-can="'warehouse_access'">
                  <b-form-select
                    class="form-control input-content input-select-warehouse"
                    v-model="warehouse" :options="warehouses" @change="selectedWarehouse(warehouse)"
                  ></b-form-select>
                </b-col>
              </b-row>
            </b-container>
          </div>
          <div class="panel-bottom"></div>
        </div>
      </div>
      <div class="product-list-body">
        <div class="scanning-input" >
          <b-form-input v-model="scanningInput" class="input-scanning"
            @keyup.enter="searchAndSelectedProduct(scanningInput)"
           autofocus ref="scanningInput" placeholder="បញ្ចូលបារកូដទំនិញ..."></b-form-input>
        </div>
        <div v-if="!productLoading && warehouse">
          <div class="content-product" v-if="products && products.length > 0">
            <div  v-for="p in products" class="pro-item" v-bind:key="p.product_id" @click="selectProductItem(p)">
              <div class="pro-img" :style="{ backgroundImage: `url('${p.img}')` }">
                <div class="pro-price">{{ p.price }} {{ p.currency }}</div>
              </div>
              <div class="pro-name">
                <div>{{ p.name }}</div>
                <div>{{ p.code }}</div>
              </div>
              <div class="clearboth"></div>
            </div>
            <div class="clearboth"></div>
          </div>
        </div>
        <div class="content-loading" v-if="productLoading && warehouse">
          <div class="spinner-grow text-muted"></div>
        </div>
        <h5 class="text-center margin-top-25" v-if="!warehouse && products.length === 0">Please select warehouse for display all product</h5>
        <h5 class="text-center margin-top-25" v-if="!productLoading && warehouse && products.length === 0">No product data</h5>
      </div>
    </div>
</template>

<script>
  export default {
    props: {
    cashBalance : 0
  },
    data() {
      return {
        categories : [],
        products : [],
        productList : [],
        searchInput: null,
        scanningInput: null,
        productLoading: false,
        warehouses : [{text : "ជ្រើសរើស ឃ្លាំងទំនិញ", value : null}],
        warehouse: null,
        searchInputData: null,
        selectedItems:[],
      };
    },
    watch:{
      searchInput(val) {
        this.searchInputData = val;
      }
    },
    methods: {
      async getListProduct($warehouse){
        let vm = this;
        vm.products = [];
        vm.productList = [];
        vm.productLoading = true;
        let $cookiesWarehouse = vm.$store.$cookies.get('storeItem');
        if($warehouse){
          await vm.$axios.post('/api/stockbywarehouse',{'warehouse' : $warehouse ? $warehouse : $cookiesWarehouse, pagination: false}).then(function (response) {
            if(response && response.hasOwnProperty("data")){
              vm.productLoading = false;
              let dataResponse = (response.data && response.data.hasOwnProperty("data")) ? response.data.data : response.data;
              if(dataResponse && dataResponse.length > 0){
                vm.totalRows = (response.data && response.data.hasOwnProperty("data")) ? response.data.total : response.data.length;
                for(let i=0; i < dataResponse.length; i++){
                  let productList = dataResponse[i];
                  if(productList && productList.length > 0){
                    for(let index=0; index < productList.length; index++){
                      let productItem =  { id: '', product_id: null, name: null,kh_name : null, price : 0, currency:'USD', img :'', code : null};
                      productItem.id = productList[index].id;
                      productItem.product_id = productList[index].product_id;
                      productItem.name = productList[index].en_name + " (" + productList[index].kh_name + ")";
                      productItem.kh_name = productList[index].kh_name;
                      productItem.price = productList[index].sale_price;
                      productItem.img = (productList[index].image !== "no image" && productList[index].image !== "no image created" ) ? vm.generateImageUrlDisplay(productList[index].image) : "images/no_icon.png";
                      productItem.code = productList[index].code;
                      vm.products.unshift(productItem);
                    }
                  }
                  else if(productList && productList.hasOwnProperty("id")){
                    let productItem =  { id: '',product_id: null, name: null,kh_name : null, price : 0, currency:'USD', img :'', code : null};
                    productItem.id = productList.id;
                    productItem.product_id = productList.product_id;
                    productItem.name = productList.en_name + " (" + productList.kh_name + ")";
                    productItem.kh_name = productList.kh_name;
                    productItem.price = productList.sale_price;
                    productItem.img = (productList.image !== "no image" && productList.image !== "no image created") ? vm.generateImageUrlDisplay(productList.image) : "images/no_icon.png";
                    productItem.code = productList.code;
                    vm.products.unshift(productItem);
                  }
                }
                vm.productList = vm.cloneObject(vm.products);
              }
            }
          }).catch(function (error) {
            console.log(error);
            vm.$toast.error("getting data error ").goAway(2000);
          });
        }
        else {
          await vm.$axios.get('/api/stocksell').then(function (response) {
            if(response && response.hasOwnProperty("data")){
              vm.productLoading = false;
              let dataResponse = response.data;
              if(dataResponse && dataResponse.length > 0){
                vm.totalRows = response.data.length;
                for(let i=0; i < dataResponse.length; i++){
                  let productList = dataResponse[i].product;
                  if(productList && productList.length > 0){
                    for(let index=0; index < productList.length; index++){
                      let productItem =  { id: '', product_id: null, name: null, kh_name : null, price : 0, currency:'USD', img :'', code : null};
                      productItem.id = productList[index].id;
                      productItem.product_id = productList[index].product_id;
                      productItem.name = productList[index].en_name + " (" + productList[index].kh_name + ")";
                      productItem.kh_name = productList[index].kh_name;
                      productItem.price = productList[index].sale_price;
                      productItem.img = productList[index].image !== "no image" ? vm.generateImageUrlDisplay(productList[index].image) : productList[index].image;
                      productItem.code = productList[index].code;
                      //vm.products.push(productItem);
                      vm.products.unshift(productItem);
                    }
                  }
                  else if(productList && productList.hasOwnProperty("id")){
                    let productItem =  { id: '', product_id:null, name: null, kh_name : null, price : 0, currency:'USD', img :'', code : null};
                    productItem.id = productList.id;
                    productItem.product_id = productList.product_id;
                    productItem.name = productList.en_name + " (" + productList.kh_name + ")";
                    productItem.kh_name = productList.kh_name;
                    productItem.price = productList.sale_price;
                    productItem.img = (productList.image !== "no image" && productList.image !== "no image created") ? vm.generateImageUrlDisplay(productList.image) : productList.image;
                    productItem.code = productList.code;
                    //vm.products.push(productItem);
                    vm.products.unshift(productItem);
                  }
                }
                vm.productList = vm.cloneObject(vm.products);
              }
            }
          }).catch(function (error) {
            console.log(error);
            vm.$toast.error("getting data error ").goAway(2000);
          });
        }
      },
      onSubmit(event) {
        event.preventDefault();
        alert(JSON.stringify(this.form));
      },
      selectProductItem(item){
        this.$emit('selectProduct', item);
      },
      cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
      },
      generateImageUrlDisplay(img){
        if (typeof window !== "undefined") {
          return window.location.protocol + "//" + window.location.hostname + ":8000/" + "storage/img/" + img;
        }
      },
      async searchProduct($warehouse, $searchInput = null){
          let self = this;
          await self.$axios.post('/api/stockbywarehouse', {'warehouse' : $warehouse ? $warehouse : self.warehouse, pagination: false, "search": $searchInput ? $searchInput : self.searchInputData})
            .then(function (response) {
              if(response && response.hasOwnProperty("data") && response.data.length > 0){
                let items = [];
                self.responseProductList = response.data;
                let datas =  response.data;
                for(let i=0; i < datas.length; i++){
                  let productList = datas[i];
                  if(productList && productList.length > 0){
                    for(let index=0; index < productList.length; index++){
                      let productItem =  { id: '', product_id: null, name: null, kh_name: null, price : 0, currency:'USD', img :'', code : null};
                      productItem.id = productList[index].id;
                      productItem.product_id = productList[index].product_id;
                      productItem.name = productList[index].en_name + " (" + productList[index].kh_name + ")";
                      productItem.kh_name = productList[index].kh_name;
                      productItem.price = productList[index].sale_price;
                      productItem.img = (productList[index].image !== "no image" && productList[index].image !== "no image created" ) ? self.generateImageUrlDisplay(productList[index].image) : "images/no_icon.png";
                      productItem.code = productList[index].code;
                      items.unshift(productItem);
                    }
                  }
                  else if(productList && productList.hasOwnProperty("id")){
                    let productItem =  { id: '', product_id: null, name: null, kh_name: null, price : 0, currency:'USD', img :'', code : null};
                    productItem.id = productList.id;
                    productItem.product_id = productList.product_id;
                    productItem.name = productList.en_name + " (" + productList.kh_name + ")";
                    productItem.kh_name = productList.kh_name;
                    productItem.price = productList.sale_price;
                    productItem.img = (productList.image !== "no image" && productList.image !== "no image created") ? self.generateImageUrlDisplay(productList.image) : "images/no_icon.png";
                    productItem.code = productList.code;
                    items.unshift(productItem);
                  }
                }
                  self.products = self.cloneObject(items);
              }
              else{
                  self.products = [];
              }
          }).catch(function (error) {
              console.log(error);
              self.$toast.error("getting data error ").goAway(2000);
          });
      },
      handleClick(e) {
        if(e.target.value === '' || e.target.value === null || e.target.value === undefined){
          this.searchInput = '';
          //this.getListProduct(this.warehouse);
        }
      },
      async searchAndSelectedProduct(scanningInput){
        let self = this;
        if(scanningInput !== "" && scanningInput !== null){
          await self.$axios.post('/api/stockbywarehouse', {'warehouse' : this.warehouse ? this.warehouse : self.warehouse, pagination: false, "search": scanningInput})
            .then(function (response) {
              if(response && response.hasOwnProperty("data")){
                let foundItem = false;
                if(response.data && response.data.length > 0){
                  foundItem = true;
                  for(let productList of response.data){
                    let productItem =  { id: '', product_id: null, name: null, kh_name: null, price : 0, currency:'USD', img :'', code : null};
                    productItem.id = productList["id"];
                    productItem.product_id = productList["product_id"];
                    productItem.name = productList["en_name"] + " (" + productList["kh_name"] + ")";
                    productItem.kh_name = productList.kh_name;
                    productItem.price = productList['sale_price'];
                    productItem.img = (productList['image'] !== "no image" && productList["image"] !== "no image created" ) ? self.generateImageUrlDisplay(productList["image"]) : "images/no_icon.png";
                    productItem.code = productList['code'];
                    self.$emit('selectProduct', productItem);
                    self.scanningInput = null;
                    break;
                  }
                }
                if(!foundItem){
                  alert("មិនមាន ទំនិញប្រភេទនេះទេ !!!");
                  self.scanningInput = null;
                }
              }

            }).catch(function (error) {
              console.log(error);
              self.$toast.error("getting data error ").goAway(2000);
            });

          /*console.log( this.productList);
          for (let index=0; index < this.productList.length; index++){
            let productItem = this.productList[index];
            if(productItem["code"] === scanningInput || productItem["name"] === scanningInput){
              foundItem = true;
              //debugger;
              this.$emit('selectProduct', productItem);
              this.scanningInput = null;
              break;
            }
          }
          if(!foundItem){
            alert("មិនមាន ទំនិញប្រភេទនេះទេ !!!");
            this.scanningInput = null;
          }*/
        }
      },
      async getWareHouseList(){
        let self = this;
        await self.$axios.get('/api/warehouse').then(function (response) {
          if(response.data.hasOwnProperty("data")){
            for(let index=0; index < response.data.data.length; index++){
              self.warehouses.push({text : response.data.data[index]["name"], value : response.data.data[index]["id"]});
            }
          }
        })
          .catch(function (error) {
            self.$toast.error("getting data error ").goAway(2000);
            console.log(error);
          });
      },
      selectedWarehouse(warehouse){
        this.$emit('selectWarehouse', warehouse);
        if(warehouse){
          this.getListProduct(warehouse);
        }
      },
      checkingToClearData(searchInput){
        console.log(searchInput);
      },
      async getListAllProduct($warehouse){
        let vm = this;
        vm.productList = [];
        let $cookiesWarehouse = vm.$store.$cookies.get('storeItem');
        if($warehouse){
          await vm.$axios.post('/api/stockbywarehouse',{'warehouse' : $warehouse ? $warehouse : $cookiesWarehouse, pagination: false}).then(function (response) {
            if(response && response.hasOwnProperty("data")){
              vm.productLoading = false;
              let dataResponse = (response.data && response.data.hasOwnProperty("data")) ? response.data.data : response.data;
              if(dataResponse && dataResponse.length > 0){
                vm.totalRows = (response.data && response.data.hasOwnProperty("data")) ? response.data.total : response.data.length;
                for(let i=0; i < dataResponse.length; i++){
                  let productList = dataResponse[i];
                  if(productList && productList.length > 0){
                    for(let index=0; index < productList.length; index++){
                      let productItem =  { id: '',product_id: null, name: null, kh_name: null, price : 0, currency:'USD', img :'', code : null};
                      productItem.id = productList[index].id;
                      productItem.product_id = productList[index].product_id;
                      productItem.name = productList[index].en_name + " (" + productList[index].kh_name + ")";
                      productItem.kh_name = productList[index].kh_name;
                      productItem.price = productList[index].sale_price;
                      productItem.img = (productList[index].image !== "no image" && productList[index].image !== "no image created" ) ? vm.generateImageUrlDisplay(productList[index].image) : "images/no_icon.png";
                      productItem.code = productList[index].code;
                      vm.productList.unshift(productItem);
                    }
                  }
                  else if(productList && productList.hasOwnProperty("id")){
                    let productItem =  { id: '', product_id: null, name: null, kh_name: null, price : 0, currency:'USD', img :'', code : null};
                    productItem.id = productList.id;
                    productItem.product_id = productList.product_id;
                    productItem.name = productList.en_name + " (" + productList.kh_name + ")";
                    productItem.kh_name = productList.kh_name;
                    productItem.price = productList.sale_price;
                    productItem.img = (productList.image !== "no image" && productList.image !== "no image created") ? vm.generateImageUrlDisplay(productList.image) : "images/no_icon.png";
                    productItem.code = productList.code;
                    vm.productList.unshift(productItem);
                  }
                }
              }
            }
          }).catch(function (error) {
            console.log(error);
            vm.$toast.error("getting data error ").goAway(2000);
          });
        }
      },
    },
    mounted() {
      this.warehouse = this.$store.$cookies.get('storeItem');
      if(this.$store.$cookies.get('storeItem')){
      this.$refs.scanningInput.focus();
      //this.getListAllProduct(this.warehouse);
       // console.log(this.$store.$cookies.get('storeItem'));
        //this.getListProduct(this.$store.$cookies.get('storeItem'));
      }
      this.getWareHouseList();
    }
  }
</script>

<style scoped>
  .content-panel-right-full-width{
    width: 100%;
  }
  .input-select-warehouse{
    padding-top: 3px;
  }
  .category-item {
      padding: 10px;
      text-align: left;
      vertical-align: center;
      cursor: pointer;
      min-width: 100px;

  }
  .category-item:hover {
      background-color: #000;
      color:#fff;
  }
  .product-list-header {
      border-bottom: 2px solid #000;
      display: inline-block;
      width: 100%;
      z-index: 1000;
  }
  .pro-item {
      float: left;
      background:#fff;
      padding: 5px;
      border-radius: 10px;
      margin: 2px;
      min-width: 160px;
      cursor: pointer;
  }
  .pro-img {
      background-repeat: no-repeat;
      padding: 58px;
    background-size: contain;
  }
  .pro-price{
    color :#fff;
    background-color: #000;
    border-radius: 5px;
    position: absolute;
    margin-top: -53px;
    margin-left: -22px;
    padding: 3px 5px;
  }
  .pro-name{
    text-align: center;
    font-size: 14px;
    margin-top: 5px;
    font-weight: 600;
  }
  .scanning-input{
    margin: 5px 0;
  }

  .product-list-body{
    margin-top: 10px;
  }

  .content-product{
    display: inline-block;
    overflow-y: auto;
    /*max-height: 480px;*/
    position: relative;
    max-height: calc(100vh - 125px);
  }
</style>
