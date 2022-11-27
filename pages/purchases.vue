<template>
  <b-container fluid class="bv-example-row">
    <div class="main-page-content">
      <div class="control-panel">
        <div class="panel-top">
          <div class="content-panel-left" style="width: 20%;">
            <h3 class="head-title">{{$t('content_title_purchase')}}</h3>
          </div>
          <div class="content-panel-right content-panel-right-full-width"
            style="vertical-align: text-bottom; width: 80%;">
          </div>
        </div>
      </div>
      <div class="content-product content-order-list">
        <div class="content-loading" v-if="isLoading">
          <div class="spinner-grow text-muted"></div>
        </div>
        <div v-if="!isLoading && items && items.length > 0">
          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-purchase" style="display: none;">
                  <thead class="table-header">
                    <tr class="tr-header">
                      <th class="th-header" style="width: 10%;">{{ $t('label_date_purchase') }}</th>
                      <th class="th-header" style="width: 10%;">{{ $t('label_purchase_by') }}</th>
                      <th class="th-header" style="width: 10%;">{{ $t('label_supplier_name') }}</th>
                      <th class="th-header" style="width: 15%;">{{ $t('label_product_name') }}</th>
                      <th class="th-header" style="width: 7%;">{{ $t('label_quantity') }}</th>
                      <th class="th-header" style="width: 10%;">{{ $t('label_import_price') }} ($)</th>
                      <th class="th-header" style="width: 10%;">{{ $t('label_sub_total') }} ($)</th>
                      <th class="th-header" style="width: 15%;">{{ $t('label_grand_total') }} ($)</th>
                      <th class="th-header" style="width: 10%;">{{ $t('title_action') }}</th>
                    </tr>
                  </thead>
                  <tbody class="table-body" style="max-height: calc(100vh - 300px)">
                    <tr class="table-body-tr" v-for="item in items" v-bind:key="item.purchase_id">
                      <td class="content-td" style="width: 10%;">
                        <b class="content">{{ (item.date !== undefined ? item.date : "") }}</b>
                      </td>
                      <td class="content-td" style="width: 10%;">
                        <b class="content">{{ (item.purchase_by !== undefined ? item.purchase_by : "") }}</b>
                      </td>
                      <td class="content-td" style="width: 10%;">
                        <b class="content">{{ (item.supplier !== undefined ? item.supplier : "") }}</b>
                      </td>
                      <td class="content-td" style="width: 15%;">
                        <b class="content">{{ (item.name !== undefined ? item.name : "") }}</b>
                      </td>
                      <td class="content-td" style="width: 7%;">
                        <b class="content">{{ (item.quantity !== undefined ? item.quantity : "") }}</b>
                      </td>
                      <td class="content-td" style="width: 10%;">
                        <b class="content">{{ (item.unitprice !== undefined ? item.unitprice : "") }}</b>
                      </td>
                      <td class="content-td" style="width: 10%;">
                        <b class="content">{{ (item.subtotal !== undefined ? item.subtotal : "") }}</b>
                      </td>
                      <td class="content-td" style="width: 15%;">
                        <b class="content">{{ (item.grand_total !== undefined ? item.grand_total : "") }}</b>
                      </td>
                      <td class="content-td" style="width: 10%;" v-show="item.purchase_id" :rowspan="item.lengthDetail">
                        <b-button size="sm" title="View data" class="btn-no-background" @click="viewDetailData(item)">
                          <i class="fa fa-eye"></i>
                        </b-button>
                        <b-button size="sm" title="Edit order data" class="btn-no-background"
                          @click="UpdateDetailData(item,  $event.target)">
                          <i class="fa fa-edit"></i>
                        </b-button>
                        <b-button size="sm" title="Remove order data" class="btn-no-background-danger"
                          @click="openConfirmToRemove(item)">
                          <i class="fa fa-trash"></i>
                        </b-button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <b-table id="my-table-purchase" class="table table-striped table-bordered table-purchase" v-if="items"
                  sticky-header="true" :items="items" :fields="itemsFields" head-variant="light">
                  <template #cell(actions)="row">
                    <b-button size="sm" title="View data" class="btn-no-background" @click="viewDetailData(row.item)">
                      <i class="fa fa-eye"></i>
                    </b-button>
                    <b-button size="sm" title="Edit order data" class="btn-no-background"
                      @click="UpdateDetailData(row.item,  $event.target)">
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

        </div>
      </div>
    </div>
    <b-modal id="modal-detail-purchase" ref="detail-purchase-form-modal" size="lg" modal-class="payment-form-modal"
      @hidden="onResetEditPayment" ok-only ok-variant="secondary" footer-class="justify-content-center"
      @ok="handleSubmit" ok-title="បិទ" title="ការនាំទំនិញចូល" no-close-on-backdrop>
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
        <b-table style="height: 500px !important; font-family: 'Arial', 'Khmer', sans-serif;"
          table-class="table-product-detail" :items="itemsProductDetail" :fields="fieldsProductDetail" :per-page="0"
          stacked="md" show-empty small>
        </b-table>
      </div>
      <div class="container-row-form width-15-percentage float-right" style="font-size: 20px;">
        <b>សរុប : {{ grandTotalPrice(itemsProductDetail) }} $</b>
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
      purchaseSelect: null
    }
  },
  watch: {
    products: {
      handler: function (products) {
        if (products.length > 0) {
          this.getDataPurchase();
        }
      }
    }
  },
  methods: {
    async getListProduct() {
      let vm = this;
      vm.products = [];
      vm.productOptions = [];

      await vm.$axios.get('/api/product').then(function (response) {
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
                vm.suppliers.unshift(supplierItem);
              }
            }
          }
        }).catch(function (error) {
          console.log(error);
          vm.$toast.error("Getting data error").goAway(3000);
        });
    },
    async getDataPurchase() {
      let self = this;
      self.isLoading = true;
      self.items = [];
      await self.$axios.get('/api/purchase')
        .then(function (response) {
          self.isLoading = false;
          let data = self.cloneObject(response.data.data);
          if (data && data.length > 0) {
            self.purchaseList = self.cloneObject(data);
            let itemPurchase = [];

            for (let index = 0; index < data.length; index++) {
              let purchaseItem = self.cloneObject(data[index]);
              let supplier = self.suppliers.find(item => item.value === purchaseItem["supplier_id"]);
              let user = self.cloneObject(self.$store.$cookies.get('user'));
              let itemData = [];

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

              for (let indexProduct = 0; indexProduct < purchaseItem["purchasedetails"].length; indexProduct++) {
                let purchaseDetailItem = self.cloneObject(purchaseItem["purchasedetails"][indexProduct]);
                if (purchaseDetailItem && purchaseDetailItem.created_at) {
                  date = moment(purchaseDetailItem.created_at, "YYYY-MM-DD").format("DD/MM/YYYY").toString();
                }
                let qty = parseInt(purchaseDetailItem["quantity"]);
                let unitprice = parseFloat(purchaseDetailItem["unitprice"]);
                subtotal = (subtotal + (qty * unitprice));
                grand_total = grand_total + parseFloat(qty * unitprice);
              }
              itemData["date"] = date;
              itemData["subtotal"] = subtotal.toFixed(2);
              itemData["grand_total"] = grand_total.toFixed(2);
              self.items.push(itemData);
            }
          }
        })
        .catch(function (error) {
          console.log(error);
          self.$toast.success("Submit data getting error").goAway(3000);
        });
    },
    cloneObject(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    viewDetailData(item) {
      this.purchase = item;
      this.itemsProductDetail = [];
      let purchaseDetailList = [];
      let purchaseDetailArray = [];

      if (this.purchaseList.length > 0) {
        for (let index = 0; index < this.purchaseList.length; index++) {
          if (this.purchaseList[index]["id"] === item.purchase_id) {
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
              data["saleprice"] = productItem["sale_price"];
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
      this.$refs["detail-purchase-form-modal"].show();
    },

    UpdateDetailData(item, $target) {
      this.purchaseSelect = item;

      let purchaseDetailList = [];
      let purchaseDetailArray = [];
      let listProductAlreadyAdd = [];
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
              data["id"] = productItem["id"];
              data["name"] = (productItem["en_name"] + " " + productItem["kh_name"]);
              data["code"] = productItem["code"];
              data["quantity"] = parseInt(purchaseDetailList[indexPurchase]["quantity"]);
              data["unitprice"] = purchaseDetailList[indexPurchase]["unitprice"];
              data["saleprice"] = parseFloat(productItem["sale_price"]);
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
        } else {
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
      dataSubmit.warehouse_id = self.$store.$cookies.get('storeItem');
      dataSubmit.supplier_id = self.purchase.supplier;
      dataSubmit.vat = self.purchase.vat;
      dataSubmit.batch = self.purchase.batch;
      dataSubmit.items = [];
      let subTotal = 0;
      let totalVat = 0;
      let priceAfterDiscount = 0;

      let purchaseDetail = [];
      let subtotal = 0;
      for (let index = 0; index < self.itemsProductDetail.length; index++) {
        let purchaseDetailItem = {};
        purchaseDetailItem['product_id'] = self.itemsProductDetail[index]['id'];
        purchaseDetailItem['unitprice'] = self.itemsProductDetail[index]['unitprice'];
        purchaseDetailItem['quantity'] = self.itemsProductDetail[index]['quantity'];
        subtotal = subtotal + parseFloat(self.itemsProductDetail[index]['subtotal']);
        purchaseDetail.unshift(purchaseDetailItem);
      }

      let vat = self.purchase.vat !== null ? parseFloat(self.purchase.vat) : 0;
      dataSubmit["purchases"] = purchaseDetail;
      dataSubmit["subtotal"] = subtotal;
      const grandtotal = (subtotal + (subtotal * vat));
      dataSubmit["grandtotal"] = grandtotal.toFixed(2);
      self.$toast.info("Data starting submit").goAway(1500);
      if (self.purchaseSelect.hasOwnProperty("id") && self.purchaseSelect.id) {
        self.$axios.put('/api/purchase/' + self.purchaseSelect.id, dataSubmit).then(function (response) {
          if (response.data.success === true) {
            self.$nextTick(() => {
              self.$refs['edit-purchase-form-modal'].hide();
            });
            self.getDataPurchase();
            self.$toast.success("Submit data successfully").goAway(2000);
          }
        })
          .catch(function (error) {
            self.$toast.error("getting data error ").goAway(2000);
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
  },
  mounted() {
    this.getListProduct();
    this.getAllWarehouse();
    this.getAllSupplier();
    // if(this.products && this.products.length > 0){
    //   this.getDataPurchase();
    // }
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
  max-height: calc(100vh - 275px);
}
</style>
