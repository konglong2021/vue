<template>
  <b-container fluid class="bv-example-row main-page-content">
    <b-row>
      <div class="inventory-dashboard-content main-page-content">
        <div class="control-panel">
          <div class="panel-top">
            <div class="content-panel-left">
              <h3 class="head-title">{{ $t('content_title_product') }}</h3>
            </div>
            <div class="content-panel-right">
              <b-container class="col-6 mx-auto menu-wrapper">
                <b-row>
                  <b-col>
                    <div class="input-group input-group-sm search-content">
                      <span class="input-group-addon button-search-box"><i class="fa fa-search"></i></span>
                      <input class="form-control input-search-box" type="search" placeholder="Search..."
                        v-model="searchInput" @keyup.enter="searchProduct()" @change="handleClick" />
                    </div>
                  </b-col>
                  <div class="btn-wrapper" v-can="'product_create'">
                    <b-button href="#" title="Add new Category" size="sm" variant="primary" @click="showModal()">
                      {{ $t('title_new_product') }}
                      <i class="fa fa-plus" aria-hidden="true"></i>
                    </b-button>
                  </div>
                </b-row>
              </b-container>
            </div>
            <div class="panel-bottom"></div>
          </div>
        </div>
        <div class="content-product" v-bind:class="{ 'content-product-full-height': isLoading }">
          <div style="display: inline-block; width: 100%; margin-bottom: 20px">
            <div v-can="'warehouse_access'"
              style="display: inline-block; width: 13%; float: right; margin-right: 10px; margin-bottom: 10px">
              <b-form-select class="form-control input-content input-select-warehouse" v-model="warehouse"
                :options="warehouses" @change="selectedWarehouse(warehouse)"></b-form-select>
            </div>
          </div>
          <div class="content-loading" v-if="isLoading">
            <div class="spinner-grow text-muted"></div>
          </div>
          <div v-if="!isLoading">
            <div v-if="items" class="display-inline-block full-with">
              <b-table class="content-table-scroll-product" id="tableau" sticky-header="true" :items="items"
                :fields="fields" :per-page="0" :current-page="currentPage" head-variant="light">
                <template #cell(code)="row">
                  <div style="display: inline-block; overflow : hidden;">
                    <barcode :value="row.item.code" height='30' width='1.9' marginTop="0" marginBottom="0" fontSize="12"
                      textMargin="1"></barcode>
                  </div>
                </template>
                <template #cell(actions)="row">
                  <b-button v-can="'product_view'" size="sm" variant="primary" title="View Product Data Detail"
                    @click="viewDetail(row.item, row.index, $event.target)" class="mr-1">
                    <i class="fa fa-eye"></i>
                  </b-button>
                  <b-button v-can="'product_edit'" size="sm" title="Product edit" variant="success"
                    @click="adjustProduct(row.item, row.index, $event.target)">
                    <i class="fa fa-edit"></i>
                  </b-button>
                  <b-button v-if="row.item.sale_price" v-can="'product_access'" size="sm" title="Print barcode"
                    variant="primary" @click="barcodeInputNumberPrint(row.item)">
                    <i class="fa fa-print"></i>
                  </b-button>
                </template>
                <!-- check this url : https://bootstrap-vue.org/docs/components/table#tables -->
              </b-table>
            </div>
            <b-pagination align="right" style="margin-top: 5px !important;" size="md" :disabled="isLoading"
              :total-rows="totalItems" v-model="currentPage" :per-page="perPage" @change="changePage($event)"
              first-number last-number>
            </b-pagination>
          </div>
          <div style="display: none;" v-if="barcodeItem && barcodeItem.code" :id="'barcode-' + barcodeItem.code">
            <div style="width: 60mm; height: 35mm; display:inline-block;"
              v-if="barcodeItem && barcodeItem.code && barcodeItem.code.length > 12">
              <span style="text-align: center !important; font-size: 12px;">{{ barcodeItem.kh_name }}</span>
              <barcode :value="barcodeItem.code" height='65' width="2" paddingTop="0" marginTop="0" marginBottom="0"
                fontSize="12" paddingBottom="0" marginLeft="0"></barcode>
              <!--<span style="text-align: center !important; font-weight: 600; font-size: 15px;">តម្លៃ USD : {{ barcodeItem.sale_price}}</span> -->
            </div>
            <div style="width: 60mm; height: 35mm; display:inline-block;"
              v-if="barcodeItem && barcodeItem.code && barcodeItem.code.length <= 12">
              <span style="margin-left:2px; text-align: center !important; display: block; font-size: 12px;">{{
                  barcodeItem.kh_name
              }}</span>
              <barcode :value="barcodeItem.code" height='65' width="2" marginTop="0" marginBottom="0" marginLeft="0"
                fontSize="12"></barcode>
              <!-- <span
                style="margin-left:8px; text-align: center !important; display: block; font-weight: 600; font-size: 15px;">
                តម្លៃ USD : {{ barcodeItem.sale_price }}
              </span> -->
            </div>
          </div>
        </div>
        <add-new-product-modal v-model="newProductModal" :productItemSelected="productItemSelected"
          @checkingProductAdd="checkingProductAdd($event)" :warehouseList="warehouseList"
          :warehouseOption="warehouseOption" />
        <!--no need to import it will automatically rendering it -->
        <b-modal id="modal-view-product" ref="view-product-form-modal" size="lg" no-close-on-backdrop
          title="Product View" title-class="text-center mx-auto" hide-footer>
          <b-form enctype="multipart/form-data" v-if="productView !== null && productView !== undefined">
            <div style="display: inline-block; width: 100%;">
              <div class="product-data data">
                <b-row class="my-1">
                  <b-col sm="4"><label :for="'input-enname'"
                      class="label-input label-margin-top">ឈ្មោះទំនិញជាអង់គ្លេស</label></b-col>
                  <b-col sm="4">
                    <b-form-input :id="'input-enname'" type="text" v-model="productView.en_name"
                      class="input-content input-no-background" disabled></b-form-input>
                  </b-col>
                </b-row>
                <b-row class="my-1">
                  <b-col sm="4"><label :for="'input-khname'"
                      class="label-input label-margin-top">ឈ្មោះទំនិញជាខ្មែរ</label></b-col>
                  <b-col sm="4">
                    <b-form-input :id="'input-khname'" type="text" v-model="productView.kh_name"
                      class="input-content input-no-background" disabled></b-form-input>
                  </b-col>
                </b-row>
                <b-row class="my-1">
                  <b-col sm="4"><label :for="'input-category'" class="label-input label-margin-top">ប្រភេទទំនិញ</label>
                  </b-col>
                  <b-col sm="4">
                    <b-form-input :id="'input-category'" class="input-content input-no-background"
                      v-model="productView.category" disabled></b-form-input>
                  </b-col>
                </b-row>
                <b-row class="my-1">
                  <b-col sm="4"><label :for="'input-sale_price'" class="label-input label-margin-top">តម្លៃលក់</label>
                  </b-col>
                  <b-col sm="4">
                    <b-form-input :id="'input-sale_price'" type="number" class="input-content input-no-background"
                      v-model="productView.sale_price" disabled></b-form-input>
                  </b-col>
                </b-row>
                <b-row class="my-1">
                  <b-col sm="4"><label :for="'input-description'"
                      class="label-input label-margin-top">ការពិពណ៌នា</label></b-col>
                  <b-col sm="4">
                    <b-form-textarea :id="'input-description'" class="input-content input-no-background"
                      v-model="productView.description" disabled></b-form-textarea>
                  </b-col>
                </b-row>
              </div>
              <div v-if="productView.image !== null" class="product-data image">
                <div class="pro-item">
                  <img :src="generateImageUrlDisplay(productView.image)">
                </div>
              </div>
            </div>

            <div v-can="'product_view_history'" style="display: inline-block; width: 100%;">
              <div class="content-loading" v-if="isLoadingPurchaseDetail">
                <div class="spinner-grow text-muted"></div>
              </div>
              <div v-if="!isLoadingPurchaseDetail">
                <b-table class="content-table-scroll-product" id="tableau" sticky-header="true" :items="purchaseDetails"
                  :fields="fieldsPurchaseDetail" head-variant="light"></b-table>
              </div>
            </div>
          </b-form>
        </b-modal>
      </div>
    </b-row>
  </b-container>
</template>
<script>
export default {
  middleware: "local-auth",
  layout: 'inventoryui',
  data() {
    return {
      newProductModal: {
        showModal: false,
      },
      searchInput: null,
      currentPage: 1,
      perPage: 10,
      totalItems: 0,
      items: [],
      fields: [
        { key: 'name', label: this.$t('label_name') },
        {
          key: 'code', label: this.$t('title_barcode'),
          tdAttr: (_, __, { name, code }) => ({
            id: `${code}`
          }), tdClass: 'td-code'
        },
        { key: 'category_name', label: this.$t('title_category') },
        { key: 'brand', label: this.$t('title_brand') },
        { key: 'loyalty', label: 'Loyalty' },
        { key: 'sale_price', label: this.$t('label_unit_price') },
        { key: 'warehouse', label: this.$t('content_title_warehouse') },
        { key: 'actions', label: this.$t('title_action') }
      ],
      category: {}, //new item for category
      isLoading: false,
      productItemSelected: {},
      responseProductList: [],
      brandList: [],
      productView: {},
      numberPrint: 1,
      barcodeItem: { code: "" },
      barcodeListToPrint: [],
      purchaseDetails: [],
      fieldsPurchaseDetail: [
        { key: 'no', label: this.$t('label_no') },
        { key: 'date', label: this.$t('label_date_import'), },
        { key: 'quantity', label: this.$t('label_quantity') },
        { key: 'unitprice', label: this.$t('label_unit_price') + " ($)" },
      ],
      isLoadingPurchaseDetail: false,
      optionStyleHtmlToPaper: {
        specs: [
          'fullscreen=yes',
          'titlebar=no',
          'scrollbars=no'
        ],
        styles: [
          '../static/css/print.css',
        ],
        autoClose: true,
      },
      warehouse: this.$store.$cookies.get('storeItem'),
      warehouses: [{ text: "ជ្រើសរើស ឃ្លាំងទំនិញ", value: null }],
      warehouseList: [],
      warehouseOption: [],
      barcodeItemCode: null,
    }
  },
  watch: {
    newProductModal: {
      handler(val) {
      },
      deep: true
    },
  },
  methods: {
    async getAllWarehouse() {
      let vm = this;
      vm.warehouseList = [];
      vm.warehouses = [];
      await vm.$axios.get('/api/warehouse').then(function (response) {
        if (response && response.hasOwnProperty("data")) {
          if (response.data.data) {
            let dataResponse = response.data.data;
            for (let index = 0; index < dataResponse.length; index++) {
              let warehouseItem = { text: '', value: null };
              warehouseItem.text = dataResponse[index]["name"] + "(" + dataResponse[index]["address"] + ")";
              warehouseItem.value = dataResponse[index]["id"];
              vm.warehouses.unshift(warehouseItem);
              vm.warehouseList.unshift(dataResponse[index]);
              vm.warehouseOption.push({ text: (dataResponse[index]["name"] + " " + dataResponse[index]["address"]), value: dataResponse[index]["id"] });
            }
          }
        }
      }).catch(function (error) {
        console.log(error);
        vm.$toast.error("Getting data error").goAway(3000);
      });
    },
    changePage($event) {
      this.currentPage = $event;
      if (this.searchInput !== '' && this.searchInput !== null && this.searchInput !== undefined) {
        this.searchProduct(this.currentPage);
      }
      else {
        this.getListProducts(this.warehouse, this.currentPage);
      }
    },
    async getListProducts($warehouse, $page = null) {
      let self = this;
      self.isLoading = true;
      await self.$axios.post('/api/product-price/list' + ($page ? ("?page=" + $page) : (this.currentPage ? "?page=" + this.currentPage : "")), { warehouse: ($warehouse ? $warehouse : self.$store.$cookies.get('storeItem')), pagination: true }).then(function (response) {
        if (response.hasOwnProperty("data") && response.data.hasOwnProperty("data")) {
          self.isLoading = false;
          let items = [];
          let productList = response.data.data;
          self.responseProductList = productList;
          for (let index = 0; index < productList.length; index++) {
            let productItem = productList[index];
            let newItem = {};
            let brands = [];
            if (productItem["brands"] && productItem["brands"].length > 0) {
              for (let i = 0; i < productItem["brands"].length; i++) {
                brands.push(productItem["brands"][i]["name"]);
              }
            }
            newItem['id'] = productItem["id"];
            newItem['name'] = productItem["en_name"] + " (" + productItem["kh_name"] + ")";
            newItem['brand'] = brands.join(", ");
            newItem['loyalty'] = "N/A";
            newItem['image'] = productItem["image"];
            newItem['brands'] = productItem["brands"];
            if (productItem.hasOwnProperty("categories")) {
              newItem['category_name'] = productItem["categories"]["name"];
              newItem["categories"] = self.cloneObject(productItem["categories"]);
            }
            newItem['description'] = productItem["description"];
            newItem['code'] = productItem["code"];
            newItem["en_name"] = productItem["en_name"];
            newItem["kh_name"] = productItem["kh_name"];
            if (productItem.hasOwnProperty("product_price") && productItem["product_price"].length > 0) {
              newItem['sale_price'] = productItem["product_price"][0]["sale_price"];
              let warehouseItem = self.warehouseList.find(w => w.id === productItem["product_price"][0]["warehouse_id"])
              if (warehouseItem) {
                newItem['warehouse'] = warehouseItem["name"] + " (" + warehouseItem["address"] + ")";
                newItem['warehouse_id'] = warehouseItem["id"];
              }
            }
            items.push(newItem);
          }
          self.items = self.cloneObject(items);
          self.items.sort(self.sortByName);
          self.totalItems = response.data.total;
          self.perPage = response.data.per_page;
        }
      }).catch(function (error) {
        console.log(error);
        self.$toast.error("Submit data getting error").goAway(3000);
      });
    },
    sortByName(a, b) {
      if (a.kh_name === b.kh_name) {
        return a.en_name > b.en_name ? 1 : -1;
      }
      return a.kh_name > b.kh_name ? 1 : -1;
    },
    showModal() {
      this.newProductModal.showModal = true;
      this.productItemSelected = {};
    },
    viewDetail(item, index, target) {
      this.productView = item;
      console.log(item);
      this.showDetailPriceProduct(item.id);
      this.$refs['view-product-form-modal'].show();
    },
    async showDetailPriceProduct($productId) {
      let self = this;
      self.isLoadingPurchaseDetail = true;
      await self.$axios.get('/api/product/history/' + $productId).then(function (response) {
        if (response.hasOwnProperty("data") && response.data && response.data.hasOwnProperty("data")) {
          if (response.data.data.length > 0) {
            self.isLoadingPurchaseDetail = false;
            let index = 0;
            let purchaseDetails = [];
            for (let item of response.data.data) {
              let itemData = {};
              let createdDate = new Date(item["created_at"]);
              let dd = createdDate.getDate();
              let mm = createdDate.getMonth() + 1;
              let day = (dd < 10) ? ('0' + dd) : dd;
              let month = (mm < 10) ? ('0' + mm) : mm;
              let yyyy = createdDate.getFullYear();
              itemData["date"] = (day + "/" + month + "/" + yyyy);
              itemData["no"] = (index + 1);
              itemData["quantity"] = item["quantity"];
              itemData["unitprice"] = item["unitprice"];
              purchaseDetails.push(itemData);
              index++;
            }
            self.purchaseDetails = self.cloneObject(purchaseDetails);
          }
        }
      }).catch(function (error) {
        console.log(error);
        self.$toast.error("Submit data getting error").goAway(3000);
      });
    },
    adjustProduct(item, index, target) {
      this.newProductModal.showModal = true;
      this.productItemSelected = {};
      this.productItemSelected.id = item["id"];
      this.productItemSelected.en_name = item["en_name"];
      this.productItemSelected.kh_name = item["kh_name"];
      this.productItemSelected.image = item["image"];
      this.productItemSelected.warehouse = item["warehouse_id"];
      let brandList = [];
      if (item["brands"] && item["brands"].length > 0) {
        for (let index = 0; index < item["brands"].length; index++) {
          brandList.push({ name: item["brands"][index]['name'], value: item["brands"][index]['id'] });
        }
        this.productItemSelected.brand = brandList;
      }
      if (item.hasOwnProperty("categories") && item["categories"]["id"]) {
        this.productItemSelected.category = item["categories"]["id"];
      }
      this.productItemSelected.description = item["description"];
      this.productItemSelected.sale_price = item["sale_price"];
      this.productItemSelected.code = item["code"];
    },
    async checkingProductAdd($event) {
      let foundItem = false, indexItem = null, self = this;
      if ($event && $event.hasOwnProperty("brands") && $event.hasOwnProperty("itemProduct")) {
        let brands = $event.brands;
        let itemProduct = this.cloneObject($event.itemProduct);
        if (self.items.length > 0) {
          let findingItem = self.items.find(productFind => productFind.id === itemProduct.id);
          if (findingItem !== undefined) {
            foundItem = true;
            let indexFound = self.items.findIndex((x) => x.id === itemProduct.id);
            if (indexFound > -1) {
              let dataTemp = [];
              dataTemp["id"] = itemProduct["id"];
              dataTemp["sale_price"] = itemProduct["sale_price"];
              dataTemp["name"] = (itemProduct["name"] ? itemProduct["name"] : (itemProduct["en_name"] + " (" + itemProduct["kh_name"] + ")"));
              dataTemp["en_name"] = itemProduct["en_name"];
              dataTemp["kh_name"] = itemProduct["kh_name"];

              dataTemp["brands"] = itemProduct["brands"];
              dataTemp["brand"] = itemProduct["brand"];

              dataTemp["category_id"] = itemProduct["category_id"];
              dataTemp["category_name"] = itemProduct["category_name"];

              dataTemp["description"] = itemProduct["description"];
              dataTemp["loyalty"] = (itemProduct["loyalty"] ? itemProduct["loyalty"] : "N/A");
              dataTemp["code"] = itemProduct["code"];
              dataTemp["image"] = itemProduct["image"];

              let warehouseItem = self.warehouseList.find(w => w.id === itemProduct["warehouse_id"]);
              dataTemp["warehouse"] = (itemProduct["warehouse"] ? itemProduct["warehouse"] : (warehouseItem["name"] + " (" + warehouseItem["address"] + ")"));
              self.$set(self.items, indexFound, dataTemp);
            }
          }
        }
        if (foundItem === false) {
          self.items.unshift(itemProduct);
        }
      }
    },
    whenDepsChange(update) {

    },
    generateImageUrlDisplay(img) {
      if (typeof window !== "undefined") {
        return window.location.protocol + "//" + window.location.hostname + ":8000/" + "storage/img/" + img;
      }
    },
    cloneObject(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    async searchProduct($page = null) {
      this.isLoading = true;
      this.items = [];
      let self = this;
      await self.$axios.post('/api/product/search' + ($page ? "?page=" + $page : "?page=1"), { search: self.searchInput, warehouse: self.warehouse, pagination: true }).then(function (response) {
        self.isLoading = false;
        if (response) {
          let items = [];
          let responseData = (response.hasOwnProperty("data") && response.data.hasOwnProperty("data")) ? response.data.data : (response.hasOwnProperty("data") ? response.data : response);
          self.responseProductList = responseData;
          if (responseData && responseData.length > 0) {
            for (let index = 0; index < responseData.length; index++) {
              let productItem = responseData[index];
              let newItem = {};
              let brands = [];
              if (productItem["brands"] && productItem["brands"].length > 0) {
                for (let i = 0; i < productItem["brands"].length; i++) {
                  brands.push(productItem["brands"][i]["name"]);
                }
              }
              newItem['id'] = productItem["id"];
              newItem['name'] = productItem["en_name"] + " (" + productItem["kh_name"] + ")";
              newItem['brand'] = brands.join(", ");
              newItem['loyalty'] = "N/A";
              newItem['image'] = productItem["image"];
              newItem['brands'] = productItem["brands"];

              if (productItem.hasOwnProperty("categories")) {
                newItem['category_name'] = productItem["categories"]["name"];
                newItem["categories"] = self.cloneObject(productItem["categories"]);
              }

              newItem['description'] = productItem["description"];
              if (productItem.hasOwnProperty("product_price") && productItem["product_price"] && productItem["product_price"].length > 0) {
                newItem['sale_price'] = productItem["product_price"][0]["sale_price"];
                newItem["warehouse_id"] = productItem["product_price"][0]["warehouse_id"];
                let warehouseItem = self.warehouseList.find(w => w.id === productItem["product_price"][0]["warehouse_id"]);
                newItem["warehouse"] = (productItem["warehouse"] ? productItem["warehouse"] : (warehouseItem["name"] + " (" + warehouseItem["address"] + ")"));
              }
              newItem['code'] = productItem["code"];
              newItem["en_name"] = productItem["en_name"];
              newItem["kh_name"] = productItem["kh_name"];
              items.push(newItem);
            }
            self.items = self.cloneObject(items);
            self.totalItems = items.length;
          }
        }
      }).catch(function (error) {
        console.log(error);
        self.$toast.error("getting data error ").goAway(2000);
      });
    },
    handleClick(e) {
      this.currentPage = 1;
      if (e.target.value === '' || e.target.value === null || e.target.value === undefined) {
        this.searchInput = '';
      }
    },
    barcodeInputNumberPrint(item) {
      this.barcodeItemCode = item.code;
      this.barcodeItem = this.cloneObject(item);
      if (this.barcodeItem && this.barcodeItem.hasOwnProperty("code") && this.barcodeItem.code !== null && this.barcodeItem.code !== undefined && this.barcodeItem.code !== "") {
        const self = this;
        this.$nextTick(function () {
          self.$htmlToPaper(("barcode-" + self.barcodeItem.code), self.optionStyleHtmlToPaper);
          self.barcodeItem = {};
        });
      }
    },
    updateNumberBarcodePrint(input) {
      this.barcodeListToPrint = [];
      if (input > 0) {
        for (let i = 1; i <= input; i++) {
          this.barcodeListToPrint.push(this.barcodeItem.code);
        }
      }
    },
    selectedWarehouse(warehouse) {
      if (warehouse) {
        this.warehouse_id = warehouse;
        this.currentPage = 1;
        this.totalItems = 0;
        if (this.searchInput === null || this.searchInput === '' || this.searchInput === undefined) {
          this.getListProducts(warehouse);
        }
        else {
          this.searchProduct(this.currentPage);
        }
      }
    },
  },
  mounted() {
    this.getAllWarehouse();
    this.getListProducts();
  },
  computed: {
    rows() {
      return this.items.length
    }
  },
}
</script>

<style scoped>
.product-data {
  display: inline-block;
  float: left;
}

.data {
  width: 70%;
  margin: 5px;
}

.image {
  width: 28%;
}

.pro-item {
  width: 100%;
  height: 250px;
  justify-content: center;
  align-items: center;
  overflow: hidden
}

.pro-item img {
  flex-shrink: 0;
  -webkit-flex-shrink: 0;
  height: 100%;
}

#tableau .td-code {
  width: 20vw;
}

#tableau div #barcodecontainer {
  width: 100%;
}

.content-table-scroll-product {
  max-height: calc(100vh - 335px);
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
