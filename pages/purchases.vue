<template>
  <b-container fluid class="bv-example-row">
    <div class="main-page-content">
      <div class="control-panel" style="min-height: 80px;">
        <div class="panel-top">
          <div class="content-panel-left" style="width: 20%;">
            <h3 class="head-title">{{$t('content_title_purchase')}}</h3>
          </div>
          <div class="content-panel-right content-panel-right-full-width" style="width: 80%; vertical-align: top;">
            <div class="float-right" style="margin-right: 8px; width: 15%;" v-can="'warehouse_access'" v-if="warehouses && warehouses.length > 0">
              <b-form-select
                class="form-control input-content input-select-warehouse min-height-43-px"
                v-model="warehouse" :options="warehouses"
                @change="selectedWarehouse(warehouse)"
              ></b-form-select>
            </div>
            <div class="float-right" style="margin-right: 8px; width: 15%;">
              <div class="content-search">
                <multiselect
                  class="input-content content-multiple-select"
                  v-model="supplier_select" :options="supplierOptions"
                  track-by="name" label="name" :show-labels="false"
                  :placeholder="$t('label_search_by_supplier')"
                  @select="selectionChangeSupplier"
                  @remove="removeElement"
                ></multiselect>
              </div>
            </div>
            <div class="float-right" style="margin-right: 8px; width: 48%;">
              <div class="content-search float-right full-with">
                <div style="width: 42%; display: inline-block; vertical-align: top;">
                  <label style="margin-top: 12px; font-weight: normal; width: 20%; vertical-align: top;">ចាប់ពីថ្ងៃ</label>
                    <div style="width: 78%; display: inline-block;">
                      <b-form-datepicker class="min-height-43-px" style="vertical-align: middle"
                        id="datepicker-from-date" formatted="yyyy-MM-dd"
                        v-model="fromDate"
                        :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                        locale="en"
                      ></b-form-datepicker>
                    </div>
                </div>
                <div style="width: 42%; display: inline-block; vertical-align: top;">
                  <label style="margin-top: 12px; font-weight: normal; width: 20%; vertical-align: top;">ដល់ថ្ងៃ</label>
                  <div style="width: 78%; display: inline-block;">
                  <b-form-datepicker class="min-height-43-px" style="vertical-align: middle"
                      id="datepicker-to-date" v-model="toDate"
                      :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                      locale="en"
                  ></b-form-datepicker>
                    </div>
                </div>
                <div style="width: 14%; display: inline-block; vertical-align: top;">
                  <b-button class="min-height-43-px button-click btn-date-search" href="#" @click="selectDate()" title="បញ្ចូល" size="sm" variant="info">
                     <span style="display: inline-block; vertical-align: text-bottom; margin-top: 3px;">
                       <span style="vertical-align: middle;">បង្ហាញ</span>
                     <i class="fa fa-search" aria-hidden="true"></i>
                     </span>
                  </b-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="content-product content-order-list">
        <div class="content-loading" v-if="isLoading">
          <div class="spinner-grow text-muted"></div>
        </div>
        <div v-if="!isLoading">
          <div class="card" v-if="items && items.length > 0">
            <div class="card-body">
              <div class="table-responsive">
                <b-table
                  id="my-table-purchase"
                  class="table table-striped table-bordered table-purchase"
                  v-if="items" sticky-header="true"
                  :items="items" :fields="itemsFields"
                  head-variant="light"
                  :tbody-tr-class="addClassToRow"
                >
                  <template #cell(actions)="row">
                    <b-button size="sm" title="View data" class="btn-no-background" @click="viewDetailData(row.item);">
                      <i class="fa fa-eye"></i>
                    </b-button>
                    <b-button size="sm" title="Edit order data" class="btn-no-background"
                      @click="UpdateDetailData(row.item, $event.target)">
                      <i class="fa fa-edit"></i>
                    </b-button>
                    <b-button size="sm" title="Remove order data" class="btn-no-background-danger"
                      @click="openConfirmToRemove(row.item)">
                      <i class="fa fa-trash"></i>
                    </b-button>
                  </template>
                </b-table>
              </div>
            </div>
          </div>
          <h3 class="text-center color-info" v-if="items.length === 0">មិនមានទិន្នន័យនៃការនាំទំនិញចូលទេ</h3>
          <b-pagination v-if="items.length > 0"
            align="right" style="margin-top: 5px !important;" size="md" :disabled="isLoading"
            :total-rows="totalItems" v-model="currentPage" :per-page="perPage"
            @change="changePage($event)" first-number last-number>
          </b-pagination>
        </div>
      </div>
    </div>
    <b-modal id="modal-detail-purchase" ref="detail-purchase-form-modal" size="lg" modal-class="payment-form-modal"
      ok-only ok-variant="secondary" footer-class="justify-content-center"
      @ok="hideModal" ok-title="បិទ" title="ការនាំទំនិញចូល" no-close-on-backdrop>
      <div style="display: inline-block; width: 100%;" v-if="purchase && purchase.id">
        <div class="full-content margin-bottom-20">
          <div class="container-row-form width-60-percentage float-left">
            <div class="form-row-content-detail row-content-view">
              <label :for="'input-customer'" class="label-input no-margin-bottom"
                     style="width: 105px; font-family: 'Arial', 'Khmer', sans-serif;">ផ្គត់ផ្គង់ដោយ : </label>
              <strong class="input-content"
                      style="font-family: 'Arial', 'Khmer', sans-serif;">{{purchase.supplier}}</strong>
            </div>

            <div class="form-row-content-detail row-content-view">
              <label :for="'input-exchange-rate'" class="label-input no-margin-bottom"
                     style="width: 105px; font-family: 'Arial', 'Khmer', sans-serif;">នាំចូលដោយ : </label>
              <strong class="input-content" style="font-family: 'Arial', 'Khmer', sans-serif;"> {{
                  $store.$cookies.get('user').name }}</strong>
            </div>
            <div class="form-row-content-detail row-content-view">
              <label :for="'input-discount'" class="label-input no-margin-bottom"
                     style="width: 105px; font-family: 'Arial', 'Khmer', sans-serif;">Batch : </label>
              <strong class="input-content" style="font-family: 'Arial', 'Khmer', sans-serif;"> {{ purchase.batch
                }}</strong>
            </div>
          </div>
          <div class="container-row-form width-29-percentage float-right">
            <div class="form-row-content-detail row-content-view">
              <label :for="'input-vat'" class="label-input no-margin-bottom"
                     style="width: 105px; font-family: 'Arial', 'Khmer', sans-serif;">ពន្ធ : </label>
              <strong class="input-content" style="font-family: 'Arial', 'Khmer', sans-serif;"> {{ purchase.vat !== 0 ?
                purchase.vat + "%": 0 }}</strong>
            </div>
            <div class="form-row-content-detail row-content-view">
              <label :for="'input-exchange-rate'" class="label-input no-margin-bottom"
                     style="width: 105px; font-family: 'Arial', 'Khmer', sans-serif;">ថ្ងៃខែឆ្នាំចូល : </label>
              <strong class="input-content" style="font-family: 'Arial', 'Khmer', sans-serif;"> {{ purchase.date
                }}</strong>
            </div>
          </div>
        </div>
        <div style="display: inline-block; overflow:hidden; width: 100%;">
          <b-table
            style="max-height: 335px; overflow-y: auto; font-family: 'Arial', 'Khmer', sans-serif;"
            sticky-header="true"
            :items="itemsProductDetail"
            :fields="fieldsProductDetail"
            head-variant="light">
          </b-table>
        </div>
        <div class="container-row-form width-15-percentage float-right" style="font-size: 20px;">
          <b>សរុប : {{ grandTotalPrice(itemsProductDetail) }} $</b>
        </div>
      </div>
    </b-modal>
    <b-modal id="modal-edit-purchase" ref="edit-purchase-form-modal" size="lg" modal-class="payment-form-modal"
      @hidden="onResetEditPayment" ok-only ok-variant="secondary" footer-class="justify-content-center"
      @ok="handleSubmit" ok-title="កែប្រែ" title="ការនាំទំនិញចូល" no-close-on-backdrop>
      <b-form enctype="multipart/form-data" @submit.stop.prevent="onSubmitEditPurchase"
        v-if="purchase.id !== null && purchase.id !== '' && purchase.id !== undefined">
        <div class="float-left width-48-percentage" style="margin-right: 15px; margin-bottom: 15px;">
          <b-row>
            <b-col md="12" style="margin-bottom: 15px;">
              <label class="label-with">{{$t('title_supplier')}}</label>
              <b-form-select class="form-control select-content-inline display-inline-block" v-model="purchase.supplier"
                :options="suppliers"></b-form-select>
            </b-col>
            <b-col md="12" style="margin-bottom: 15px;">
              <label class="label-with">{{ $t('title_warehouse') }}</label>
              <b-form-select class="form-control select-content-inline display-inline-block"
                v-model="purchase.warehouse" :options="warehouses"></b-form-select>
            </b-col>
            <b-col md="12" style="margin-bottom: 15px;">
              <label :for="'input-product'" class="label-with">ឈ្មោះទំនិញសម្រាប់បន្ថែម</label>
              <b-form-select class="form-control select-content-inline display-inline-block" v-model="productItemAdd"
                :options="productSelectOptions" @change="addMoreProductSelectedChange(productItemAdd)"></b-form-select>
            </b-col>
          </b-row>
        </div>
        <div class="width-50-percentage float-right" style="margin-bottom: 15px;">
          <b-row>
            <b-col md="12" style="margin-bottom: 15px;">
              <div class="float-right display-inline-block full-with">
                <label class="label-with">ពន្ធ</label>
                <b-form-select class="form-control select-content-inline display-inline-block" v-model="purchase.vat"
                  :options="vats"></b-form-select>
              </div>
            </b-col>
            <b-col md="12">
              <div class="float-right display-inline-block full-with">
                <label class="label-with">Batch</label>
                <b-form-input class="form-control select-content-inline display-inline-block" v-model="purchase.batch">
                </b-form-input>
              </div>
            </b-col>
          </b-row>
        </div>
        <b-table style="font-family: 'Arial', 'Khmer', sans-serif;" table-class="table-product-detail"
          :items="itemsProductDetail" :fields="fieldsProductDetail" :per-page="0" stacked="md" show-empty small
          :tbody-tr-class="rowClass">
          <template #cell(saleprice)="row">
            <b-form-input ref="inputSaleprice" type="number" class="input-content"
                          v-bind:class="'content-input-saleprice-'+row.item.id" v-model="row.item.saleprice"
                          v-on:change="updatedDataOfCurrentProduct(row.item.saleprice, row.item, 'inputSaleprice');"
                          :autofocus="true"></b-form-input>
          </template>
          <template #cell(quantity)="row">
            <b-form-input ref="inputQuantity" type="number" class="input-content"
              v-bind:class="'content-input-quantity-'+row.item.id" v-model="row.item.quantity"
              v-on:change="updatedDataOfCurrentProduct(row.item.quantity, row.item, 'inputQuantity')" :autofocus="true">
            </b-form-input>
          </template>
          <template #cell(unitprice)="row">
            <b-form-input ref="inputUnitprice" type="number" class="input-content"
              v-bind:class="'content-input-unitprice-'+row.item.id" v-model="row.item.unitprice"
              v-on:change="updatedDataOfCurrentProduct(row.item.unitprice, row.item, 'inputUnitprice');"
              :autofocus="true"></b-form-input>
          </template>
          <template #cell(action)="row">
            <b-button size="md" class="btn-no-background-danger"
              @click="removeProductFromList(row.item,  $event.target)">
              <i class="fa fa-trash"></i>
            </b-button>
          </template>
        </b-table>
      </b-form>
    </b-modal>
    <b-modal id="modal-confirm-remove" ref="confirm-remove-form-modal" size="md" @hidden="onResetConfirm"
      ok-variant="secondary" footer-class="justify-content-center" @ok="onSubmitToRemove" ok-title="បាទ/ចាស"
      cancel-title="បោះបង់" title="ការលក់" no-close-on-backdrop>
      <h4 style="text-align: center;">ទិន្នន័យមួយនេះ និងត្រូវលុបចេញ?</h4>
    </b-modal>
  </b-container>
</template>
<script>
import $ from "jquery";
import moment from "moment";

export default {
  middleware: "local-auth",
  layout: 'inventoryui',
  props: {
  },
  data() {
    return {
      productOptions: [],
      supplier_select: null,
      customerOptions : [],
      isLoading: false,
      items: [],
      itemsFields: [
        { key: 'date', label: this.$t('label_date_purchase'), thClass: "header-th", thStyle: "font-size: 17px;" },
        { key: 'purchase_by', label: this.$t('label_purchase_by'), thClass: "header-th", thStyle: "font-size: 17px;" },
        { key: 'supplier', label: this.$t('label_supplier_name'), thClass: "header-th", thStyle: "font-size: 17px; width: 15%;" },
        { key: 'warehouse', label: this.$t('title_warehouse'), thClass: "header-th", thStyle : "font-size: 17px;width: 15%;"},
        { key: 'grand_total', label: this.$t('label_grand_total'), thClass: "header-th", thStyle: "font-size: 17px; width: 15%;" },
        { key: 'actions', label: this.$t('title_action'), thClass: "header-th", thStyle: "font-size: 17px;" },
      ],
      showData: false,
      warehouses: [],
      warehouseList: [],
      suppliers: [],
      supplierList: [],
      products: [],
      productSelectOptions: [],
      purchaseList: [],
      purchase: {
        vat: 0,
        id: null,
        import_price: 0,
        supplier: null,
        warehouse: null,
        subtotal: 0,
        grandtotal: 0,
        qty: 0,
        batch: null,
      },
      itemsProductDetail: [],
      fieldsProductDetail: [
        { key: 'name', label: 'ឈ្មោះទំនិញ', thClass: "header-th", thStyle: "font-size: 17px;" },
        { key: 'code', label: 'បារកូដ', thClass: "header-th", thStyle: "font-size: 17px;" },
        { key: 'saleprice', label: 'តម្លៃលក់ចេញ ($)', thClass: "header-th", thStyle: "font-size: 17px; width: 15%;" },
        { key: 'unitprice', label: 'តម្លៃនាំចូល ($)', thClass: "header-th", thStyle: "font-size: 17px;width: 15%;" },
        { key: 'quantity', label: 'ចំនួន', thClass: "header-th", thStyle: "font-size: 17px; width: 15%;" },
        { key: 'subtotal', label: 'តម្លៃសរុប ($)', thClass: "header-th", thStyle: "font-size: 17px;" },
      ],
      dataSelectToRemove: null,
      tr_id_select: null,
      vats: [{ text: '0%', value: 0 }, { text: '5%', value: 0.05 }, { text: '10%', value: 0.1 }, { text: '15%', value: 0.15 }],
      productItemAdd: null,
      purchaseSelect: null,
      viewRowIdSelected: null,
      editRowIdSelected: null,
      selectedRows: [],
      selectMode: 'single',
      changeColor: false,
      warehouse: this.$store.$cookies.get('storeItem'),
      currentPage: 1,
      perPage: 10,
      totalItems: 0,
      filterDate: null,
      supplierOptions: [],
      fromDate: '',
      toDate: '',
    }
  },
  watch: {
    products: {
      handler: function (products) {
        if (products.length > 0) {
          this.getDataPurchase((this.warehouse ? this.warehouse : this.$store.$cookies.get('storeItem')));
        }
      }
    }
  },
  methods: {
    changePage($event){
      this.currentPage = $event;
      if(this.searchInput !== '' && this.searchInput !== null && this.searchInput !== undefined){
        this.getDataPurchase(this.currentPage);
      }
      else {
        this.getDataPurchase(this.warehouse, this.currentPage);
      }
    },
    addClassToRow(item, type) {
      if (item && type === 'row') {
        return item && item.isSelected === true && this.purchaseSelect.id === item.id ? "table-primary" : "";
      }
    },
    async getListProduct() {
      let vm = this;
      vm.products = [];
      vm.productOptions = [];
      await vm.$axios.post('/api/product-price/list',
        {warehouse : vm.warehouse, pagination: false}
      ).then(function (response) {
        if (response && response.hasOwnProperty("data")) {
          if (response.data && response.data.length > 0) {
            vm.totalRows = response.data.length;
            vm.products = vm.cloneObject(response.data);
            for (let index = 0; index < response.data.length; index++) {
              vm.productOptions.push({
                name: (response.data[index].en_name + " - " + response.data[index].kh_name + " (" + response.data[index].code + ")"),
                value: response.data[index].id
              });
              vm.productSelectOptions.push({ text: (response.data[index].en_name + " - " + response.data[index].kh_name + " (" + response.data[index].code + ")"), value: response.data[index].id });
            }
          }
        }
      }).catch(function (error) {
        console.log(error);
        vm.$toast.error("getting data error ").goAway(2000);
      });
    },
    generateImageUrlDisplay(img) {
      if (typeof window !== "undefined") {
        if ((img !== "no image" && img !== "no image created")) {
          return (window.location.protocol + "//" + window.location.hostname + ":8000/" + "storage/img/" + img);
        }
      }
    },
    async getAllWarehouse() {
      let vm = this;
      vm.warehouseList = [];
      vm.warehouses = [];
      await vm.$axios.get('/api/warehouse').then(function (response) {
        if (response && response.hasOwnProperty("data")) {
          if (response.data.data) {
            let data = response.data.data;
            for (let index = 0; index < data.length; index++) {
              let warehouseItem = { text: '', value: null };
              warehouseItem.text = data[index]["name"] + "(" + data[index]["address"] + ")";
              warehouseItem.value = data[index]["id"];
              vm.warehouses.unshift(warehouseItem);
              vm.warehouseList.unshift(data[index]);
            }
          }
        }
      }).catch(function (error) {
        console.log(error);
        vm.$toast.error("Getting data error").goAway(3000);
      });
    },
    async getAllSupplier() {
      let vm = this;
      vm.suppliers = [];
      await vm.$axios.get('/api/supplier')
        .then(function (response) {
          if (response && response.hasOwnProperty("data")) {
            if (response.data) {
              let data = response.data;
              for (let index = 0; index < data.length; index++) {
                let supplierItem = { text: '', value: null };
                supplierItem.text = data[index]["name"] + "(" + data[index]["address"] + ")";
                supplierItem.value = data[index]["id"];
                vm.supplierOptions.push({name: data[index]["name"] + "(" + data[index]["address"] + ")", value: data[index]["id"]});
                vm.suppliers.unshift(supplierItem);
              }
            }
          }
        }).catch(function (error) {
          console.log(error);
          vm.$toast.error("Getting data error").goAway(3000);
        });
    },
    async getDataPurchase($warehouse = null, $page = null) {
      let self = this;
      self.isLoading = true;
      self.items = [];
      self.purchaseList = [];
      let dataSubmit =
        {
        "warehouse": ($warehouse ? $warehouse : self.$store.$cookies.get('storeItem')),
        "pagination":true,
        "from": self.fromDate,
        "to": self.toDate
      };
      if(self.supplier_select){
        dataSubmit["supplier_id"] = self.supplier_select["value"];
      }
      await self.$axios.post('/api/purchase-history' + ($page ? ("?page=" + $page) : (this.currentPage ? "?page=" + this.currentPage : "")), dataSubmit).then(function (response) {
          self.isLoading = false;
          let responseData = [];
          if(
            response && response.hasOwnProperty("data")
            && response.data && response.data.hasOwnProperty("data")
            && response.data.data.hasOwnProperty("data")
          ){
            responseData = self.cloneObject(response.data.data.data);
            self.totalItems = response.data.data.total;
            self.perPage = response.data.data.per_page;
          }
          if (responseData && responseData.length > 0) {
            for (let index = 0; index < responseData.length; index++) {
              let purchaseItem = self.cloneObject(responseData[index]);
              let newPurchaseItem = self.cloneObject(responseData[index]);

              let supplier = self.suppliers.find(item => item.value === purchaseItem["supplier_id"]);
              let user = self.cloneObject(self.$store.$cookies.get('user'));
              let itemData = [];
              itemData["isSelected"] = false;

              itemData["id"] = purchaseItem.id;
              itemData["purchase_id"] = purchaseItem.id;
              itemData["purchase_by"] = user.name;
              itemData["supplier"] = supplier["text"];
              itemData["batch"] = purchaseItem["batch"];
              itemData["vat"] = purchaseItem["vat"] ? purchaseItem["vat"] : 0;
              let warehouse = self.warehouseList.find(w => w.id === purchaseItem.warehouse_id);
              itemData["warehouse"] = warehouse["name"];
              let date = "";
              let grand_total = 0;
              let subtotal = 0;
              newPurchaseItem["purchasedetails"] = [];

              for (let indexProduct = 0; indexProduct < purchaseItem["purchasedetails"].length; indexProduct++) {
                let purchaseDetailItem = self.cloneObject(purchaseItem["purchasedetails"][indexProduct]);
                let newPurchaseDetailItem = self.cloneObject(purchaseItem["purchasedetails"][indexProduct]);

                if(purchaseItem.hasOwnProperty("product_price") && purchaseItem["product_price"] && purchaseItem["product_price"].length > 0){
                  let priceForCurrentProduct = purchaseItem["product_price"].find(price => price.product_id === purchaseItem["purchasedetails"][indexProduct].product_id);
                  if(priceForCurrentProduct !== undefined){
                    purchaseDetailItem["saleprice"] = priceForCurrentProduct["sale_price"];
                    newPurchaseDetailItem["saleprice"] = priceForCurrentProduct["sale_price"];
                  }
                }
                if (purchaseDetailItem && purchaseDetailItem.created_at) {
                  date = moment(purchaseDetailItem.created_at, "YYYY-MM-DD").format("DD/MM/YYYY").toString();
                }
                let qty = parseInt(purchaseDetailItem["quantity"]);
                let unitprice = parseFloat(purchaseDetailItem["unitprice"]);
                subtotal = (subtotal + (qty * unitprice));
                grand_total = grand_total + parseFloat(qty * unitprice);
                newPurchaseItem["purchasedetails"].push(newPurchaseDetailItem);
              }
              itemData["date"] = date;
              itemData["subtotal"] = subtotal.toFixed(2);
              itemData["grand_total"] = grand_total.toFixed(2);
              self.items.push(itemData);
              self.purchaseList.push(newPurchaseItem);
            }
          }
        }).catch(function (error) {
          console.log(error);
          self.$toast.success("Submit data getting error").goAway(3000);
      });
    },
    cloneObject(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    hideModal() {
      // this.purchase = {
      //   vat: 0,
      //   id: null,
      //   import_price: 0,
      //   supplier: null,
      //   warehouse: null,
      //   subtotal: 0,
      //   grandtotal: 0,
      //   qty: 0,
      //   batch: null,
      // };
      // this.purchaseSelect = null;
      this.$refs["detail-purchase-form-modal"].hide();
    },
    viewDetailData(item) {
      this.purchase = item;
      this.itemsProductDetail = [];
      let purchaseDetailList = [];
      let purchaseDetailArray = [];
      let purchaseItem = {};
      for(let itemData of this.items){
        if(itemData.id === item.id){
          itemData["isSelected"] = true;
        }
        else {
          itemData["isSelected"] = false;
        }
      }
      if (this.purchaseList.length > 0) {
        for (let index = 0; index < this.purchaseList.length; index++) {
          if (this.purchaseList[index]["id"] === item.purchase_id) {
            purchaseItem = this.cloneObject(this.purchaseList[index]);
            purchaseDetailList = this.cloneObject(this.purchaseList[index]["purchasedetails"]);
            break;
          }
        }
        if (purchaseDetailList && purchaseDetailList.length > 0) {
          for (let indexItem = 0; indexItem < purchaseDetailList.length; indexItem++) {
            let productIdSelected = purchaseDetailList[indexItem]["product_id"];
            let data = {};
            let productItem = this.products.find(product => product.id === productIdSelected);
            if (productItem) {
              data["name"] = (productItem["en_name"] + " " + productItem["kh_name"]);
              data["code"] = productItem["code"];
              data["quantity"] = parseInt(purchaseDetailList[indexItem]["quantity"]);
              data["unitprice"] = purchaseDetailList[indexItem]["unitprice"];
              data["saleprice"] = purchaseDetailList[indexItem]["saleprice"] ? purchaseDetailList[indexItem]["saleprice"] : productItem["sale_price"];
              const subtotal = (parseFloat(purchaseDetailList[indexItem]["unitprice"]) * parseInt(purchaseDetailList[indexItem]["quantity"]));
              data["subtotal"] = subtotal.toFixed(2);
              purchaseDetailArray.push(data);
            }
          }
        }
        this.itemsProductDetail = this.cloneObject(purchaseDetailArray);
      }
      let itemActionField = this.fieldsProductDetail.find(itemField => itemField.key === 'action');
      if (itemActionField) {
        let index = this.fieldsProductDetail.indexOf(itemActionField);
        this.fieldsProductDetail.splice(index, 1);
      }
      this.$nextTick(() => {
        this.$refs["detail-purchase-form-modal"].show();
      });
    },
    UpdateDetailData(item, $target) {
      this.purchaseSelect = item;
      let purchaseDetailList = [];
      let purchaseDetailArray = [];
      let listProductAlreadyAdd = [];
      Object.entries(this.items).forEach(([key, val]) => {
        val.isSelected = (val.id === item.id ? true : false);
      });
      if (this.purchaseList.length > 0) {
        let purchaseItem = this.purchaseList.find(row => row.id === item.id);
        if (purchaseItem && purchaseItem.hasOwnProperty("id")) {
          this.purchase.id = purchaseItem.id;
          this.purchase.supplier = purchaseItem.supplier_id;
          this.purchase.warehouse = purchaseItem.warehouse_id;
          this.purchase.batch = purchaseItem.batch;
          purchaseDetailList = this.cloneObject(purchaseItem["purchasedetails"]);
        }
        if (purchaseDetailList && purchaseDetailList.length > 0) {
          for (let indexPurchase = 0; indexPurchase < purchaseDetailList.length; indexPurchase++) {
            let productIdSelected = purchaseDetailList[indexPurchase]["product_id"];
            let data = {};
            let productItem = this.products.find(dataProduct => dataProduct.id === productIdSelected);
            if (productItem) {
              data["product_id"] = productItem["id"];
              data["name"] = (productItem["en_name"] + " " + productItem["kh_name"]);
              data["code"] = productItem["code"];
              data["quantity"] = parseInt(purchaseDetailList[indexPurchase]["quantity"]);
              data["unitprice"] = purchaseDetailList[indexPurchase]["unitprice"];
              data["saleprice"] = purchaseDetailList[indexPurchase]["saleprice"] ? parseFloat(purchaseDetailList[indexPurchase]["saleprice"]) : productItem["sale_price"];
              const subtotal = parseFloat(purchaseDetailList[indexPurchase]["unitprice"]) * parseInt(purchaseDetailList[indexPurchase]["quantity"]);
              data["subtotal"] = subtotal.toFixed(2);
              listProductAlreadyAdd.push(productItem["id"]);
              purchaseDetailArray.push(data);
            }
          }
        }
        this.productSelectOptions = this.productSelectOptions.filter(function (element) {
          return listProductAlreadyAdd.includes(element.value) === false;
        });
        this.itemsProductDetail = this.cloneObject(purchaseDetailArray);
      }
      let itemActionField = this.fieldsProductDetail.find(itemField => itemField.key === 'action');
      if (!itemActionField) {
        this.fieldsProductDetail.push({ key: 'action', label: this.$t('title_action'), thClass: "header-th", thStyle: "font-size: 17px;" });
      }
      this.$refs['edit-purchase-form-modal'].show();
    },

    rowClass(item, type) {
      if (item && type === 'row') {
        if (item.isAdd === true) {
          return 'active-color'
        }
        else {
          return ''
        }
      } else {
        return ''
      }
    },
    updatedDataOfCurrentProduct(dataItem, item, fieldName) {
      let data = this.itemsProductDetail.find(product => product.id === item.id);

      if (fieldName === 'inputQuantity') {
        let itemTemp = JSON.parse(JSON.stringify(data));
        let index = this.itemsProductDetail.indexOf(data);
        itemTemp.quantity = parseInt(dataItem);
        itemTemp.subtotal = (itemTemp.quantity * itemTemp.unitprice).toFixed(2);
        this.$set(this.itemsProductDetail, index, itemTemp);
      }
      else if (fieldName === 'inputUnitprice') {
        let itemTemp = JSON.parse(JSON.stringify(data));
        let index = this.itemsProductDetail.indexOf(data);
        itemTemp.unitprice = parseFloat(dataItem);
        itemTemp.subtotal = (itemTemp.quantity * itemTemp.unitprice).toFixed(2);
        this.$set(this.itemsProductDetail, index, itemTemp);
      }
      else if (fieldName === 'inputSaleprice') {
        let itemTemp = JSON.parse(JSON.stringify(data));
        let index = this.itemsProductDetail.indexOf(data);
        itemTemp.saleprice = parseInt(dataItem);
        this.$set(this.itemsProductDetail, index, itemTemp);
      }
    },
    addMoreProductSelectedChange(productItemAddId) {
      let productItemAdd = this.products.find(item => item.id === productItemAddId);
      let productAdd = {};
      if (productItemAdd) {
        if (!productItemAdd.hasOwnProperty("quantity")) {
          productAdd["id"] = productItemAdd["id"];
          productAdd["product_id"] = productItemAdd["id"];
          productAdd["code"] = productItemAdd["code"];
          productAdd["name"] = (productItemAdd["en_name"] + " " + productItemAdd["kh_name"]);

          console.log(productItemAdd);
          productAdd["saleprice"] = productItemAdd["sale_price"];
          productAdd["unitprice"] = productItemAdd["unitprice"];
          productAdd["quantity"] = 1;
          productAdd["subtotal"] = (parseInt(productAdd["quantity"]) * (productAdd["unitprice"] > 0 ? parseFloat(productAdd["unitprice"]) : 0));
          productAdd["isAdd"] = true;
          this.itemsProductDetail.unshift(productAdd);
        }
        else {
          let productItemAlreadyAdd = this.itemsProductDetail.find(product => product.id === productItemAddId);
          let indexItem = this.itemsProductDetail.indexOf(productItemAlreadyAdd);
          let itemTemp = JSON.parse(JSON.stringify(productItemAlreadyAdd));
          itemTemp["quantity"] = Number(itemTemp['quantity']) + 1;
          itemTemp["subtotal"] = (parseInt(itemTemp["quantity"]) * parseFloat(itemTemp["unitprice"]));
          if (itemTemp.hasOwnProperty("isAdd")) {
            itemTemp["isAdd"] = true;
          }
          this.$set(this.itemsProductDetail, indexItem, itemTemp);
        }
      }
    },
    onResetEditPayment() { },
    handleSubmit(bvModalEvent) {
      bvModalEvent.preventDefault();
      this.onSubmitEditPurchase();
    },
    onSubmitEditPurchase() {
      let self = this;
      let dataSubmit = {};
      dataSubmit.warehouse_id = self.purchase.warehouse;
      dataSubmit.supplier_id = self.purchase.supplier;
      dataSubmit.vat = self.purchase.vat;
      dataSubmit.batch = self.purchase.batch;
      dataSubmit.items = [];
      let purchaseDetail = [];
      let subtotal = 0;
      for (let index = 0; index < self.itemsProductDetail.length; index++) {
        let purchaseDetailItem = {};
        purchaseDetailItem["sale_price"] = self.itemsProductDetail[index]["saleprice"];
        purchaseDetailItem['product_id'] = self.itemsProductDetail[index]['product_id'];
        purchaseDetailItem['unitprice'] = self.itemsProductDetail[index]['unitprice'];
        purchaseDetailItem['quantity'] = self.itemsProductDetail[index]['quantity'];
        subtotal = subtotal + parseFloat(self.itemsProductDetail[index]['subtotal']);
        purchaseDetailItem['product_name'] = self.products.find(p => p.id === self.itemsProductDetail[index]['product_id'])["kh_name"];
        purchaseDetail.unshift(purchaseDetailItem);
      }
      let vat = self.purchase.vat !== null ? parseFloat(self.purchase.vat) : 0;
      dataSubmit["purchases"] = purchaseDetail;
      dataSubmit["subtotal"] = subtotal;
      const grandtotal = (subtotal + (subtotal * vat));
      dataSubmit["grandtotal"] = grandtotal.toFixed(2);

      self.$toast.info("ទិន្នន័យកំពុងបញ្ជូនទៅរក្សាទុក").goAway(1500);
      if (self.purchaseSelect.hasOwnProperty("id") && self.purchaseSelect.id) {
        self.$axios.put('/api/purchase/' + self.purchaseSelect.id, dataSubmit).then(function (response) {
          if (response.data.success === true) {
            self.$nextTick(() => {
              self.purchaseSelect = null;
              self.itemsProductDetail = [];
              self.$refs['edit-purchase-form-modal'].hide();
            });
            self.getDataPurchase(self.warehouse);
            self.$toast.success("ទិន្នន័យត្រូវបានរក្សាទុកបានជោគជ័យ").goAway(2000);
          }
        }).catch(function (error) {
          self.$toast.error("ការរក្សារទុកទិន្នន័យមិនជោគជ័យ").goAway(2000);
          console.log(error);
        });
      }
    },
    openConfirmToRemove(row) {
      this.dataSelectToRemove = row;
      this.tr_id_select = row["purchase_id"];
      this.$refs['confirm-remove-form-modal'].show();
    },
    onResetConfirm() { },
    async onSubmitToRemove() {
      let self = this;
      if (self.dataSelectToRemove && self.dataSelectToRemove.hasOwnProperty("purchase_id")) {
        await self.$axios.delete('/api/purchase/delete/' + self.dataSelectToRemove.purchase_id).then(function (response) {
          $("#tr-" + self.dataSelectToRemove.purchase_id).fadeOut(1000);
          self.$refs["confirm-remove-form-modal"].hide();
        }).catch(function (error) {
          console.log(error);
          self.$toast.error("getting data error ").goAway(2000);
        });
      }
    },
    removeProductFromList(item, $eventTarget) {
      let productFound = this.itemsProductDetail.find(productItem => productItem.id === item.id);
      let index = this.itemsProductDetail.indexOf(productFound);
      if (index > -1) {
        this.itemsProductDetail.splice(index, 1);
      }
    },
    grandTotalPrice(itemsProductDetail) {
      let total = [];
      Object.entries(itemsProductDetail).forEach(([key, val]) => {
        total.push(parseFloat(val.subtotal).toFixed(2));
      });
      return total.reduce(function (total, num) {
        return (parseFloat(total) + parseFloat(num));
      }, 0);
    },
    generateBatch() {
      return this.getFullDate() + "_v" + this.getFullDateAndTime();
    },
    getFullDate() {
      let today = new Date();
      let dd = today.getDate();
      let mm = (today.getMonth() + 1); //January is 0!
      let day = (dd < 10) ? ("0" + dd) : dd;
      let month = (mm < 10) ? ("0" + mm) : mm;
      let yyyy = today.getFullYear();

      return (day + "/" + month + "/" + yyyy);
    },
    selectedWarehouse(warehouse) {
      if (warehouse) {
        this.warehouse_id = warehouse;
        this.currentPage = 1;
        this.totalItems = 0;
        if(this.searchInput === null || this.searchInput === '' || this.searchInput === undefined){
          this.getDataPurchase(warehouse);
        }
        else {
          this.getDataPurchase(warehouse, this.currentPage);
        }
      }
    },
    filterDataByDate(filterDate){
      this.getDataPurchase(filterDate, this.warehouse);
    },
    removeElement(){
      this.supplier_select = null;
      this.getDataPurchase(this.warehouse);
      this.$forceUpdate();
    },
    selectionChangeSupplier($obj){
      if($obj){
        this.supplier_select = $obj;
      }
      else {
        this.supplier_select = null;
      }
      this.currentPage = 1;
      this.getDataPurchase(this.warehouse, this.currentPage);
    },
    async selectDate() {
      await this.getDataPurchase((this.warehouse ? this.warehouse : this.$store.$cookies.get('storeItem')));
    },
  },
  mounted() {
    this.getListProduct();
    this.getAllWarehouse();
    this.getAllSupplier();

    const today = new Date();
    const day = 1;
    const month = today.getMonth();
    const year = today.getFullYear();
    this.toDate = this.$moment(new Date()).format("YYYY-MM-DD");
    this.fromDate = this.$moment({ year: year, month: month, day: day }).format("YYYY-MM-DD");
  }
}
</script>

<style scoped>
.table-purchase .table-header {
  display: inline-block;
  overflow: hidden;
  width: 100%;
}

.table-purchase .table-header .tr-header {
  display: inline-block;
  overflow: hidden;
  width: 99%;
  border-bottom: 1px solid #dee2e6;
}

.table-purchase .table-header .tr-header .th-header {
  vertical-align: top;
  text-align: left;
  padding: 12px 9px;
  display: inline-block;
  overflow: hidden;
  border: none;
}

.table-purchase .table-body {
  display: inline-block;
  overflow-y: scroll;
  width: 100%;
  max-height: 75vh;
}

.table-purchase .table-body .table-body-tr {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  border-bottom: 1px solid #dee2e6;
}

.table-purchase .table-body .table-body-tr .content-td {
  display: inline-block;
  overflow: hidden;
  border-bottom: none;
  border-top: none;
  padding: 12px 9px;
}

.table-purchase {
  max-height: calc(100vh - 330px);
}
</style>
