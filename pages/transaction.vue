<template>
  <div>
    <b-container fluid class="bv-example-row">
      <div class="main-page-content">
        <div class="control-panel">
          <div class="panel-top">
            <div class="content-panel-left" style="width: 20%;">
              <h3 class="head-title">{{$t('content_title_order')}}</h3>
            </div>
            <div class="content-panel-right content-panel-right-full-width" style="vertical-align: text-bottom; width: 80%;">
              <div class="float-right" v-can="'warehouse_access'">
                <b-form-select  class="form-control input-content input-select-warehouse min-height-43-px" v-model="warehouse" :options="warehouses" @change="selectedWarehouse(warehouse)"></b-form-select>
              </div>
              <div class="float-right product" style="margin-right: 8px; display: none;">
                <div class="content-search" >
                  <multiselect class="input-content content-multiple-select"
                               v-model="product_select" :options="productOptions"
                               track-by="name" label="name" :show-labels="false"
                               :placeholder="$t('label_search_by_product')"
                               @select="selectionChangeProduct"
                               @remove="removeElement"></multiselect>
                </div>
              </div>
              <div class="float-right" style="margin-right: 8px; display: inline-block;">
                <b-form-select class="form-control input-content input-select-warehouse min-height-43-px" v-model="status_select" :options="statusList" @change="selectedStatusSale(status_select)"></b-form-select>
              </div>
              <div class="float-right" style="margin-right: 8px">
                <div class="content-search" >
                  <multiselect class="input-content content-multiple-select"
                               v-model="customer_select" :options="customerOptions"
                               track-by="name" label="name" :show-labels="false"
                               :placeholder="$t('label_search_by_customer')"
                               @select="selectionChangeCustomer"
                               @remove="removeElement"></multiselect>
                </div>
              </div>
              <div class="float-right" style="margin-right: 8px">
                <div class="content-search" >
                  <b-form-input class="min-height-42-px" type="date" v-model="filterDate" placeholder="ស្វែងរកតាមថ្ងៃ" v-on:change="filterDataByDate(filterDate)"></b-form-input>
                </div>
              </div>
              <div class="float-right" style="margin-right: 8px; display: inline-block;">
                <b-button class="min-height-43-px" v-if="product_select || customer_select" @click="printFilterData()" size="sm" title="ចុច ដើម្បី ព្រីនតារាង" variant="success">ចុចព្រីនតារាង</b-button>
              </div>
            </div>
          </div>
        </div>
        <div class="content-product content-order-list">
          <div style="height: calc(100vh - 245px); display: inline-block; width: 100%; overflow:hidden;">
            <div class="content-loading" v-if="isLoading">
              <div class="spinner-grow text-muted"></div>
            </div>
            <div class="content-table-data" v-if="!isLoading">
              <div v-if="items">
                <div class="table-responsive" v-if="items.length > 0">
                  <b-table id="my-table-stock" class="table table-striped table-bordered"
                           v-if="items"
                           :items="items"
                           :fields="itemsFields"
                           responsive
                           head-variant="light"
                  >
                    <template #cell(status)="row">
                      <div v-html="row.item.status"></div>
                    </template>
                    <template #cell(actions)="row">
                      <b-button v-can="'pos_access'" size="sm" title="View data" class="btn-no-background" @click="viewOrderData(row.item)">
                        <i class="fa fa-eye"></i>
                      </b-button>
                      <b-button v-can="'pos_edit'" size="sm" title="Edit order data" class="btn-no-background" @click="UpdateOrderData(row.item,  $event.target)">
                        <i class="fa fa-edit"></i>
                      </b-button>
                      <b-button v-can="'pos_delete'" size="sm" title="Remove order data" class="btn-no-background-danger" @click="openConfirmToRemoveOrder(row.item)">
                        <i class="fa fa-trash"></i>
                      </b-button>
                    </template>
                  </b-table>
                </div>
                <h3 class="text-center color-info" v-if="items.length === 0">មិនមានទិន្នន័យនៃការលក់ទេ</h3>
                <div class="content-detail">
                  <h5 v-if="product_select">ចំនួនលក់សរុបទាំងអស់ : {{ sumAllSaleProduct(items) }}</h5>
                  <h5 v-if="product_select">សរុបទឹកប្រាក់ទាំងអស់ : {{ sumAllPriceSaleProduct(items) + "$"}}</h5>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!filterDate && (!customer_select || (customer_select && !customer_select.value))" class="display-inline-block full-with">
            <b-pagination align="right" style="margin-top: 5px !important;" size="md" :disabled="isLoading" :total-rows="totalItems" v-model="currentPage" :per-page="perPage" first-number last-number></b-pagination>
          </div>
        </div>
      </div>
      <b-modal id="modal-detail-payment" ref="detail-payment-form-modal" size="lg" modal-class="payment-form-modal"
               @hidden="onResetPrint" ok-only ok-variant="secondary" footer-class="justify-content-center"
               @ok="onSubmitToPrint" ok-title="ព្រីនចេញ" title="ការលក់" no-close-on-backdrop>
        <b-form enctype="multipart/form-data" style="display: inline-block; width: 100%; height: 100%; overflow: hidden;">
          <div class="full-content margin-bottom-20">
            <div class="container-row-form width-60-percentage float-left">
              <div class="form-row-content-detail row-content-view">
                <label class="label-input no-margin-bottom" style="width: 105px; font-family: 'Arial', 'Khmer OS Bokor', sans-serif;">វិក័យប័ត្រលេខ</label>
                <strong class="input-content" style="font-family: 'Arial', 'Khmer OS Bokor', sans-serif;">{{order.invoice_id}}</strong>
              </div>
              <div class="form-row-content-detail row-content-view" >
                <label :for="'input-customer'" class="label-input no-margin-bottom" style="width: 105px; font-family: 'Arial', 'Khmer OS Bokor', sans-serif;">ឈ្មោះអតិថិជន : </label>
                <strong class="input-content" style="font-family: 'Arial', 'Khmer OS Bokor', sans-serif;">{{order.customer}}</strong>
              </div>

              <div class="form-row-content-detail row-content-view">
                <label :for="'input-exchange-rate'" class="label-input no-margin-bottom" style="width: 105px; font-family: 'Arial', 'Khmer OS Bokor', sans-serif;">លក់ដោយ : </label>
                <strong class="input-content" style="font-family: 'Arial', 'Khmer OS Bokor', sans-serif;"> {{ $store.$cookies.get('user').name }}</strong>
              </div>
            </div>
            <div class="container-row-form width-29-percentage float-right">
              <div class="form-row-content-detail row-content-view">
                <label :for="'input-vat'" class="label-input no-margin-bottom" style="width: 105px; font-family: 'Arial', 'Khmer OS Bokor', sans-serif;">ពន្ធ : </label>
                <strong class="input-content" style="font-family: 'Arial', 'Khmer OS Bokor', sans-serif;"> {{ order.vat !== 0 ? order.vat + "%": 0 }}</strong>
              </div>

              <div class="form-row-content-detail row-content-view">
                <label :for="'input-discount'" class="label-input no-margin-bottom" style="width: 105px; font-family: 'Arial', 'Khmer OS Bokor', sans-serif;">បញ្ចុះតម្លៃ : </label>
                <strong class="input-content" style="font-family: 'Arial', 'Khmer OS Bokor', sans-serif;"> {{ order.discount + "%" }}</strong>
              </div>
              <div class="form-row-content-detail row-content-view">
                <label :for="'input-exchange-rate'" class="label-input no-margin-bottom" style="width: 105px; font-family: 'Arial', 'Khmer OS Bokor', sans-serif;">ថ្ងៃខែឆ្នាំលក់ : </label>
                <strong class="input-content" style="font-family: 'Arial', 'Khmer OS Bokor', sans-serif;"> {{ order.date }}</strong>
              </div>
            </div>
          </div>
          <b-table table-class="table-payment"
                   :items="itemsProductDetail"
                   :fields="fieldsProductDetail"
                   stacked="md"
                   show-empty
                   small
          >
          </b-table>
          <div style="display: inline-block;float: right;margin-top: 25px;">
            <span style="display: block;">{{ $t('title_total_in_usd') }} : {{ order.subtotal }} USD</span>
            <span style="display: block; margin-top: 10px;">{{ $t('label_vat') }} ($) : {{ vatPrice(order) }} USD</span>
            <span style="display: block; margin-top: 10px;">{{$t('title_total_after_vat_in_usd')}} : {{ grandTotalWithVat(order) }} USD</span>
            <span style="display: block; margin-top: 10px;" v-if="order.subtotal">{{$t('title_total_in_riel')}} : {{ calculateToRiel(grandTotalWithVat(order), order.exchange_rate) }} Riel</span>

          </div>
        </b-form>
        <div id="invoice-print-pos-again" style="padding-top : 50px; margin: 5px; display: none; width: 100%; height: 100%; overflow: hidden; font-family: 'Arial', 'Khmer OS Bokor', sans-serif !important;">
          <h6 class="text-center" style="margin-top: 35px; font-family: 'Arial', 'Khmer', sans-serif; font-size: 12px;">{{ $t('title') }}</h6>
          <table style="font-size: 10px; margin-bottom: 20px;">
            <tbody>
            <tr>
              <td style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; font-weight: 700; padding: 0;">វិក័យប័ត្រលេខ : {{ order.invoice_id }}</td>
            </tr>
            <tr>
              <td style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; font-weight: 700; padding: 0;">ថ្ងៃខែឆ្នាំលក់ : {{ order.date }}</td>
            </tr>
            <tr>
              <td style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; font-weight: 700; padding: 0;">លក់ដោយ : {{ order.sale_by }}</td>
            </tr>
            </tbody>
          </table>
          <table style="text-align: center;">
            <thead style="">
              <tr>
                <th style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10.5px; text-transform: uppercase; border-top:1px solid black; margin-bottom: 4px; border-bottom: 1px solid black; vertical-align: middle;">ឈ្មោះទំនិញ</th>
                <th style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10.5px; text-transform: uppercase; border-top:1px solid black; margin-bottom: 4px; border-bottom: 1px solid black; vertical-align: middle; width: 5%;">ចំនួន</th>
                <th style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10.5px; text-transform: uppercase; border-top:1px solid black; margin-bottom: 4px; border-bottom: 1px solid black; vertical-align: middle; width: 20%;">តម្លៃ($)</th>
                <th style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10.5px; text-transform: uppercase; border-top:1px solid black; margin-bottom: 4px; border-bottom: 1px solid black; vertical-align: middle; width: 25%;">សរុប($)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item of itemsProductDetail">
                <td style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px;">{{ item.kh_name }}</td>
                <td style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px;">{{ item.qty }}</td>
                <td style="font-size: 10px; content: '\20B9';font-family: 'Arial';text-align: right;">{{ item.price }}</td>
                <td style="font-size: 10px; content: '\20B9';font-family: 'Arial';text-align: right;">{{ item.total }}</td>
              </tr>
              <tr>
                <td colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; border-top:1px solid black !important; text-align: right !important;">សរុប ($)</td>
                <td colspan="2" style="font-size: 10px; text-align: right;content: '\20B9'; font-family: 'Arial'; border-top:1px solid black !important;">{{ order.subtotal }}</td>
              </tr>
              <tr>
                <td colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; text-align: right !important;">ពន្ធ ($) ({{ order.vat * 100 }} %)</td>
                <td colspan="2" style="font-size: 10px; text-align: right;content: '\20B9'; font-family: 'Arial';">{{ vatPrice(order) }}</td>
              </tr>
              <tr>
                <td colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; text-align: right !important;">បញ្ចុះតម្លៃ</td>
                <td colspan="2" style="font-size: 10px; text-align: right;content: '\20B9'; font-family: 'Arial';">{{ discountPrice(order) }}</td>
              </tr>
              <tr>
                <th colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10.5px; border-top:1px dashed black !important; border-bottom:1px dashed black !important; text-align: right;">សរុបបូកបញ្ចូលពន្ធ ($)</th>
                <th colspan="2" style="font-size: 13px; border-top:1px dashed black !important; border-bottom:1px dashed black !important; text-align: right;">{{ (parseFloat(order.grandtotal) + parseFloat(vatPrice(order))) }}</th>
              </tr>
              <tr>
                <th colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10.5px; border-top:1px dashed black !important; border-bottom:1px dashed black !important; text-align: right;">តម្លៃសរុប (៛)</th>
                <th colspan="2" style="font-size: 13px; border-top:1px dashed black !important; border-bottom:1px dashed black !important; text-align: right;">{{ calculateToRiel((parseFloat(order.grandtotal) + parseFloat(vatPrice(order))), order.exchange_rate) }}</th>
              </tr>


              <tr>
                <th colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10.5px; border-top:1px solid black !important; text-align: right;"></th>
                <th colspan="2" style="font-size: 13px; border-top:1px dashed black !important; border-top:1px solid black !important; text-align: right;"></th>
              </tr>
              <tr>
                <th colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; text-align: right !important;">ទទួលប្រាក់ ($)</th>
                <th colspan="2" style="font-size: 10px; text-align: right;content: '\20B9'; font-family: 'Arial';">{{ order.receive_money_usd }}</th>
              </tr>
              <tr>
                <th colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; text-align: right !important;">ទទួលប្រាក់ (៛)</th>
                <th colspan="2" style="font-size: 10px; text-align: right;content: '\20B9'; font-family: 'Arial';">{{ order.receive_money_kh }}</th>
              </tr>

              <tr>
                <th colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; text-align: right !important;">លុយត្រូវអាប់ ($)</th>
                <th colspan="2" style="font-size: 10px; text-align: right;content: '\20B9'; font-family: 'Arial';">{{ order.return_money_usd }}</th>
              </tr>
              <tr>
                <th colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; text-align: right !important;">លុយត្រូវអាប់ (៛)</th>
                <th colspan="2" style="font-size: 10px; text-align: right;content: '\20B9'; font-family: 'Arial';">{{ $util.format(order.return_money_kh)}}</th>
              </tr>
            </tbody>
          </table>
          <footer style="font-family: 'Arial', 'Khmer', sans-serif; text-align:center; font-size: 10px; margin-top: 45px;">
            <p style="text-align:center; margin-bottom: 0; padding-bottom: 0;">ទំនិញទិញហើយ មិនអាចប្តុរជាទឹកប្រាក់វិញបានទេ</p>
            <p style="text-align:center; margin-bottom: 0; padding-bottom: 0; margin-top: 4px; padding-top: 0">អរគុណសម្រាប់ការគាំទ្រ</p>
          </footer>
        </div>
      </b-modal>
      <b-modal
        id="modal-edit-payment" ref="edit-payment-form-modal" size="lg" modal-class="payment-form-modal"
        @hidden="onResetEditPayment" ok-only ok-variant="secondary" footer-class="justify-content-center"
        @ok="handleSubmit" ok-title="កែប្រែ" title="ការលក់" no-close-on-backdrop>
        <b-form enctype="multipart/form-data" style="display: inline-block; width: 100%; height: 100%; overflow: hidden;" @submit.stop.prevent="onSubmitEditPayment">
          <div class="full-content margin-bottom-20">
            <div class="container-row-form width-30-percentage float-left">
              <div class="form-row-content-detail">
                <div class="form-column-label">
                  <label :for="'input-customer'" class="label-input no-margin-bottom">ឈ្មោះអតិថិជន</label>
                </div>
                <div class="form-column-input width-50-percentage">
                  <b-form-select class="form-control input-content" v-model="order.customer" :options="customers" @change="updateCustomerSelected(order.customer)"></b-form-select>
                </div>
              </div>
              <div class="form-row-content-detail" style="width:100%">
                <div class="form-column-label">
                  <label :for="'input-vat'" class="label-input no-margin-bottom">ពន្ធ</label>
                </div>
                <div class="form-column-input width-50-percentage">
                  <b-form-select  class="form-control input-content" v-model="order.vat" :options="vats"></b-form-select>
                </div>
              </div>
            </div>
            <div class="container-row-form width-30-percentage float-right">
              <div class="form-row-content-detail float-right" style="width:100%">
                <div class="form-column-label">
                  <label :for="'input-discount'" class="label-input no-margin-bottom">បញ្ចុះតម្លៃ</label>
                </div>
                <div class="form-column-input width-50-percentage">
                  <b-form-input type="number" class="input-content" v-model="order.discount" @change="updatedPriceInListDetailOrder(order.discount)"></b-form-input>
                </div>
              </div>
              <div class="form-row-content-detail float-right" style="width:100%">
                <div class="form-column-label">
                  <label :for="'input-product'" class="label-input no-margin-bottom">ឈ្មោះទំនិញសម្រាប់បន្ថែម</label>
                </div>
                <div class="form-column-input width-50-percentage">
                  <b-form-select class="form-control input-content" v-model="productItemAdd" :options="productSelectOptions" @change="addMoreProductSelectedChange(productItemAdd)"></b-form-select>
                </div>
              </div>
            </div>
            <b-table style="font-family: 'Arial', 'Khmer OS Bokor', sans-serif;" table-class="table-product-detail"
                     :items="itemsProductDetail"
                     :fields="fieldsProductDetail"
                     :per-page="0"
                     stacked="md"
                     show-empty
                     small
                      :tbody-tr-class="rowClass"
            >
              <template #cell(qty)="row">
                <b-form-input :ref="'inputQty' + row.item.id" type="number" class="input-content" v-bind:class="'content-input-qty-'+row.item.id" v-model="row.item.qty" v-on:change="updatedDataOfCurrentProduct(row.item.qty, row.item, 'qty')"></b-form-input>
              </template>
              <template #cell(price)="row">
                <b-form-input :ref="'inputPrice' + row.item.id" type="number" class="input-content" v-bind:class="'content-input-price-'+row.item.id" v-model="row.item.price" v-on:change="updatedDataOfCurrentProduct(row.item.price, row.item, 'price')"></b-form-input>
              </template>
              <template #cell(action)="row">
                <b-button size="md" class="btn-no-background-danger" @click="removeProductFromListOfOrder(row.item,  $event.target)">
                  <i class="fa fa-trash"></i>
                </b-button>
              </template>
            </b-table>
          </div>
        </b-form>
      </b-modal>
      <b-modal id="modal-confirm-remove-order" ref="confirm-remove-order-form-modal" size="md"
               @hidden="onResetConfirm" ok-variant="secondary" footer-class="justify-content-center"
               @ok="onSubmitToRemove" ok-title="បាទ/ចាស" cancel-title="បោះបង់" title="ការលក់" no-close-on-backdrop>
        <h4 class="text-center">ទិន្នន័យការលក់មួយនេះ និងត្រូវលុបចេញ?</h4>
      </b-modal>
    </b-container>
  </div>
</template>
<script>
  import moment from 'moment';
  import $ from 'jquery';
  export default {
    middleware: "local-auth",
    layout:'posui',
    data(){
      return {
        currentPage: 1,
        perPage: 10,
        totalItems: 0,
        vats: [{text: '0%', value: 0}, {text: '5%', value: 0.05}, {text: '10%', value: 0.1}, {text: '15%', value: 0.15}],
        items: [],
        itemsFields: [
          {key: 'date', label: this.$t('label_date_sale')},
          { key: 'sale_by', label: this.$t('label_sale_by')},
          { key: 'customer', label: this.$t('label_customer_name')},
          { key: 'ref', label: "Reference"},
          { key: 'invoice_id', label: this.$t('label_number_invoice')},
          { key: 'subtotal', label: "សរុប ($)"},
          { key: 'discount', label: this.$t('label_discount') + " (%)"},
          { key: 'vat', label: this.$t('label_vat') + " (%)"},
          { key: 'grandtotal', label: "សរុបរួម ($)"},
          {key : 'receive', label: this.$t('label_receive_money')},
          {key : 'status', label: "ស្ថានភាព"},
          {key : 'actions', label: this.$t('title_action')}
        ],
        fields: [
          { key: 'sale_by', label: this.$t('label_sale_by')},
          { key: 'customer', label: this.$t('label_customer_name')},
          { key: 'discount', label: this.$t('label_discount')},
          { key: 'vat', label: this.$t('label_vat')},
          { key: 'name', label: this.$t('label_product_name')},
          { key: 'receive', label: this.$t('label_receive_money')},
        ],
        itemsProductDetail: [],
        fieldsProductDetail: [
          { key: 'number', label: 'លេខរៀង', thClass: "header-th", thStyle : "font-size: 17px;"},
          { key: 'name', label: 'ឈ្មោះទំនិញ', thClass: "header-th", thStyle : "font-size: 17px;"},
          { key: 'qty', label: 'ចំនួន', thClass: "header-th", thStyle : "font-size: 17px; width: 15%;"},
          { key: 'price', label: 'តម្លៃឯកតា ($)', thClass: "header-th", thStyle : "font-size: 17px;width: 15%;"},
          { key: 'total', label: 'តម្លៃសរុប ($)', thClass: "header-th" , thStyle : "font-size: 17px;"},
          { key: 'discount', label: 'បញ្ចុះតម្លៃ (%)', thClass: "header-th", thStyle : "font-size: 17px;"},
          { key: 'total_after_discount', label: 'តម្លៃសរុប បន្ទាប់ពី បញ្ចុះតម្លៃ ($)', thClass: "header-th", thStyle : "font-size: 17px;"},
          { key: 'action', label: this.$t('title_action'), thClass: "header-th", thStyle : "font-size: 17px;"},
        ],
        fieldsProductDetailPrint: [
          { key: 'name', label: 'ឈ្មោះទំនិញ', thClass: "header-th", thStyle : "font-size: 17px;"},
          { key: 'qty', label: 'ចំនួន', thClass: "header-th", thStyle : "font-size: 17px; width: 15%;"},
          { key: 'price', label: 'តម្លៃឯកតា ($)', thClass: "header-th", thStyle : "font-size: 17px;width: 15%;"},
          { key: 'total', label: 'តម្លៃសរុប ($)', thClass: "header-th" , thStyle : "font-size: 17px;"},
        ],
        warehouses : [{text : "ជ្រើសរើស ឃ្លាំងទំនិញ", value : null}],
        warehouse: null,
        products : [],
        isLoading: false,
        customers: [],
        customersList: [],
        optionStyleHtmlToPaper: {
          specs: [
            'fullscreen=yes',
            'titlebar=no',
            'scrollbars=no'
          ],
          styles: [
            '../static/css/invoice-print.css',
          ],
          autoClose: true,
        },
        orderList: [],
        orderItemList: [],
        order: {
          customer: null,
          vat: 0,
          discount: 0,
          invoice_id: null,
          exchange_rate: 4100,
          subtotal : 0,
          receive_money_usd: 0,
          receive_money_kh: 0,
        },
        product_select: null,
        productOptions : [],
        productSelectOptions : [],
        isSearchByProduct: false,
        isSearchByCustomer: false,
        customer_select: null,
        customerOptions : [],
        isUpdatedOrderData: false,
        isAddProduct: false,
        productItemAdd: null,
        orderItemSelectEdit: {},
        orderItemSelectToRemoveId: null,
        tr_id_select: null,
        filterDate: null,
        status_select: null,
        statusList: [{ text: 'ស្វែងរកតាមស្ថានការណ៏(Status)', value: null }, { text: 'Completed', value: "complete" },{ text: 'Pending', value: "pending" }]
      }
    },
    watch: {
      currentPage: {
        handler: function(value) {
          this.currentPage = value ? value : 1;
          this.getAllOrderData();
        }
      }
    },
    computed: {
      rows() {
        return this.items.length
      },
    },
    methods: {
      discountPrice(order){
        const discountPrice = (parseFloat(order.subtotal) * (parseFloat(order.discount) / 100));
        return discountPrice.toFixed(2);
      },
      vatPrice(order){
        const totalAfterDiscount = (parseFloat(order.subtotal) - this.discountPrice(order));
        const vatPrice = (totalAfterDiscount * (parseFloat(order.vat) / 100));
        return vatPrice.toFixed(2);
      },
      grandTotalWithVat(order){
        const totalAfterDiscount = (parseFloat(order.subtotal) - this.discountPrice(order));
        const grandTotal = (parseFloat(order.grandtotal) + ((parseFloat(order.vat) / 100) * totalAfterDiscount));
        return grandTotal.toFixed(2);
      },
      async getListProduct($warehouse){
        let vm = this;
        vm.products = [];
        vm.productOptions= [];

        await vm.$axios.get('/api/stock').then(function (response) {
          if(response && response.hasOwnProperty("data")){
            let dataResponse = response.data;
            if(dataResponse && dataResponse.length > 0){
              vm.totalRows = response.data.length;
              for(let i=0; i < dataResponse.length; i++){
                let productList = dataResponse[i].product;
                if(productList && productList.length > 0){
                  for(let index=0; index < productList.length; index++){
                    let productItem =  { id: '', name: null, price : 0, currency:'USD', img :'', code : null};
                    productItem.id = productList[index].id;
                    productItem.en_name = productList[index].en_name;
                    productItem.kh_name = productList[index].kh_name;
                    productItem.name = productList[index].en_name + " (" + productList[index].kh_name + ")";
                    productItem.price = productList[index].sale_price;
                    productItem.img = productList[index].image !== "no image" ? vm.generateImageUrlDisplay(productList[index].image) : productList[index].image;
                    productItem.code = productList[index].code;
                    vm.products.push(productItem);
                    vm.productOptions.push({name: (productList[index].en_name + " - " + productList[index].kh_name + " (" + productList[index].code + ")"), value: productItem.id})
                    vm.productSelectOptions.push({text: (productList[index].en_name + " - " + productList[index].kh_name + " (" + productList[index].code + ")"), value: productItem.id});
                  }
                }
                else if(productList && productList.hasOwnProperty("id")){
                  let productItem =  { id: '', name: null, price : 0, currency:'USD', img :'', code : null};
                  productItem.id = productList.id;
                  productItem.name = productList.en_name + " (" + productList.kh_name + ")";
                  productItem.en_name = productList.en_name;
                  productItem.kh_name = productList.kh_name;
                  productItem.price = productList.sale_price;
                  productItem.img = (productList.image !== "no image" && productList.image !== "no image created") ? vm.generateImageUrlDisplay(productList.image) : productList.image;
                  productItem.code = productList.code;
                  vm.products.push(productItem);
                  vm.productOptions.push({name: (productItem.en_name + " - " +productItem.kh_name + " (" + productItem.code + ")"), value: productItem.id})
                  vm.productSelectOptions.push({text: (productItem.en_name + " - " +productItem.kh_name + " (" + productItem.code + ")"), value: productItem.id});
                }
              }
            }
          }
        }).catch(function (error) {
          console.log(error);
          vm.$toast.error("getting data error ").goAway(2000);
        });
      },
      async getCustomerList(){
        let self = this;
        await self.$axios.get('/api/customer').then(function (response) {
          if(response.hasOwnProperty("data") && response.data.hasOwnProperty("customer")){
            self.customersList = self.cloneObject(response.data.customer);
            for(let index=0; index < response.data.customer.length; index++){
              self.customers.push({text : response.data.customer[index]["name"], value : response.data.customer[index]["id"]});
              self.customerOptions.push({name: response.data.customer[index]["name"], value: response.data.customer[index]["id"]})
            }
          }
        })
          .catch(function (error) {
            self.$toast.error("getting data error ").goAway(2000);
            console.log(error);
          });
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
      async getAllOrderData($filterDate = null, $warehouse = null){
        let self = this;
        self.isLoading = true;
        self.items = [];
        let api = ($filterDate ? ("/saletoday/" + $filterDate) : ("/salebywarehouse"));
        let fullApi = (api + ("/" + ($warehouse ? $warehouse : self.$store.$cookies.get('storeItem'))) + ($filterDate== null ? ("?page=" + self.currentPage) : ""));
        await self.$axios.get('/api' + fullApi).then(function (response) {
          self.isLoading = false;
          if($filterDate){
            self.orders = response.data;
            self.orderList = self.cloneObject(response.data);
          }
          else {
            if(response && response.hasOwnProperty("data") && response.data && response.data.hasOwnProperty("data")){
              self.orders = response.data.data;
              self.orderList = self.cloneObject(response.data.data);

            }
          }
          if(self.orders.length > 0){
            for(let indexOrder =0; indexOrder < self.orders.length; indexOrder++){
              let orderItem = self.orders[indexOrder];
              let date = "";
              if(orderItem && orderItem.created_at){
                date = moment(orderItem.created_at, "YYYY-MM-DD").format("DD/MM/YYYY").toString();
              }

              let customerItem = self.filterDataCustomerList(orderItem.customer_id);
              let user = self.cloneObject(self.$store.$cookies.get('user'));
              let itemData = [];
              let grandtotal = 0;
              let subtotal = 0;
              let status_code = 'pending';

              for(let indexOrderDetail =0; indexOrderDetail < orderItem.orderdetails.length; indexOrderDetail++){
                let orderDetailItem = orderItem.orderdetails[indexOrderDetail];

                subtotal = subtotal + (parseInt(orderDetailItem.quantity) * parseFloat(orderDetailItem["sellprice"]));
                if(orderItem["discount"] > 0){
                  let totalItem = (parseInt(orderDetailItem.quantity) * parseFloat(orderDetailItem["sellprice"]));
                  grandtotal = grandtotal + (totalItem - ((parseFloat(orderItem["discount"]) / 100) * totalItem));
                }
                else {
                  grandtotal = grandtotal + (parseInt(orderDetailItem.quantity) * parseFloat(orderDetailItem["sellprice"]));
                }
              }

              itemData["subtotal"] = subtotal.toFixed(2);
              itemData["grandtotal"] = grandtotal.toFixed(2);
              itemData["date"] = date;
              itemData["order_id"] = orderItem.id;
              itemData["sale_by"] = user.name;

              itemData["receive_money_kh"] =  orderItem["receive_money_kh"];
              itemData["receive_money_usd"] =  orderItem["receive_money_usd"];

              itemData["return_money_kh"] =  orderItem.return_money_kh;
              itemData["return_money_usd"] =  orderItem.return_money_usd;

              if(customerItem){
                itemData["customer"] = customerItem["name"];
              }

              itemData["invoice_id"] = orderItem["invoice_id"];
              itemData["discount"] = (orderItem["discount"] > 0 ? orderItem["discount"] : 0);
              itemData["vat"] = ((orderItem.hasOwnProperty("vat") && orderItem["vat"] > 0) ? (orderItem["vat"] * 100) : 0);
              itemData["receive"] = orderItem["receive"];
              itemData["status"] = (parseFloat(orderItem["receive"]) === parseFloat(itemData["grandtotal"])) ? "<div class=' badge badge-success badge-radius'>Completed</div>" : "<div class='badge badge-danger badge-radius'>Pending</div>";
              if(parseFloat(itemData["receive"]) === grandtotal){
                status_code = 'complete';
              }
              itemData["status_code"] = status_code;
              self.items.push(itemData);
              self.orderItemList.push(itemData);
            }
            self.totalItems = response.data.total;
            self.perPage = response.data.per_page;
          }
        }).catch(function (error) {
          console.log(error);
          self.$toast.error("getting data error ").goAway(2000);
        });
      },

      filterDataCustomerList(itemId){
        if(this.customersList && this.customersList.length > 0){
          for(let index=0; index < this.customersList.length; index++){
            if(itemId === this.customersList[index].id){
              return this.customersList[index];
            }
          }
        }
      },
      selectedWarehouse(warehouse){
        if(warehouse){
          this.getListProduct( warehouse);
          this.getAllOrderData(null, warehouse);
        }
      },
      generateImageUrlDisplay(img){
        if (typeof window !== "undefined") {
          if((img !== "no image" && img !== "no image created")){
            return (window.location.protocol + "//" + window.location.hostname + ":8000/" + "storage/img/" + img) ;
          }
        }
      },
      cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
      },
      viewOrderData(item){
        console.log(item);
        this.order = item;
        this.itemsProductDetail = [];
        let discount = 0;
        let orderDetailList = [];
        let orderDetailArray = [];
        this.order.exchange_rate = 4100;

        if(this.orderList.length > 0){
          for(let index =0; index < this.orderList.length; index++){
            if(this.orderList[index]["id"] === item.order_id){
              discount = item.discount;
              orderDetailList = this.cloneObject(this.orderList[index]["orderdetails"]);
              break;
            }
          }
          if(orderDetailList && orderDetailList.length > 0){
            for(let indexOrder = 0; indexOrder < orderDetailList.length; indexOrder++){
              let productIdSelected = orderDetailList[indexOrder]["product_id"];
              let data = {};
              let productItem = null;

              if(this.products && this.products.length > 0){
                for(let k=0; k < this.products.length; k++){
                  if(productIdSelected === this.products[k].id){
                    productItem = this.cloneObject(this.products[k]);
                    break;
                  }
                }
              }
              if(productItem){
                data["number"] = (indexOrder + 1);
                data["name"] = productItem["name"];
                data["kh_name"] = productItem["kh_name"];
                data["qty"] = parseInt(orderDetailList[indexOrder]["quantity"]);
                data["price"] = orderDetailList[indexOrder]["sellprice"];

                let total = (parseFloat(orderDetailList[indexOrder]["sellprice"]) * parseInt(orderDetailList[indexOrder]["quantity"]));
                data["total"] = total.toFixed(2);
                data["discount"] = discount > 0 ? (discount) : 0;
                let total_after_discount = total - (total * (discount / 100));
                data["total_after_discount"] = total_after_discount.toFixed(2);
                orderDetailArray.push(data);
              }
            }
          }
          this.itemsProductDetail = this.cloneObject(orderDetailArray);
        }
        this.$nextTick(() => {
          this.$refs["detail-payment-form-modal"].show();
        });
      },
      UpdateOrderData(row, $event){
        this.orderItemSelectEdit = row;
        this.itemsProductDetail = [];
        let discount = 0;
        let orderDetailList = [];
        let orderDetailArray = [];
        this.isUpdatedOrderData = true;
        let listProductAlreadyAdd = [];

        if(this.orderList.length > 0){
          for(let index =0; index < this.orderList.length; index++){
            if(this.orderList[index]["id"] === row.order_id){
              this.order.customer = this.orderList[index]["customer_id"];
              this.order.invoice_id = this.orderList[index]["invoice_id"];
              this.order.discount = this.orderList[index]["discount"];
              this.order.vat = this.orderList[index]["vat"];
              discount = this.orderList[index]["discount"];
              orderDetailList = this.cloneObject(this.orderList[index]["orderdetails"]);
              break;
            }
          }
          if(orderDetailList && orderDetailList.length > 0){
            for(let indexOrder = 0; indexOrder < orderDetailList.length; indexOrder++){
              let productIdSelected = orderDetailList[indexOrder]["product_id"];
              let data = {};
              let productItem = null;

              if(this.products && this.products.length > 0){
                for(let k=0; k < this.products.length; k++){
                  if(productIdSelected === this.products[k].id){
                    productItem = this.cloneObject(this.products[k]);
                    break;
                  }
                }
              }
              if(productItem){
                data["number"] = (indexOrder + 1);
                data["id"] =  productItem["id"];
                data["name"] = productItem["name"];
                data["qty"] = parseInt(orderDetailList[indexOrder]["quantity"]);
                data["price"] = orderDetailList[indexOrder]["sellprice"];
                let total = (parseFloat(orderDetailList[indexOrder]["sellprice"]) * parseInt(orderDetailList[indexOrder]["quantity"]));
                data["total"] = total;
                data["discount"] = discount > 0 ? (discount) : 0;
                data["total_after_discount"] = total - (total * (discount / 100));
                listProductAlreadyAdd.push(productItem["id"]);
                orderDetailArray.push(data);
              }
            }
          }
          this.productSelectOptions = this.productSelectOptions.filter(function (element) {
            return listProductAlreadyAdd.includes(element.value) === false;
          });
          this.itemsProductDetail = this.cloneObject(orderDetailArray);
        }
        this.$refs['edit-payment-form-modal'].show();
      },
      addProductButtonClick(){
        this.isAddProduct = true;
      },
      addMoreProductSelectedChange(productItemAddId){
        let productItemAdd = this.products.find(item => item.id === productItemAddId);
        if(productItemAdd){
          if(!productItemAdd.hasOwnProperty("qty")){
            productItemAdd["qty"] = 1;
            productItemAdd["total"] = (parseInt(productItemAdd["qty"]) * parseFloat(productItemAdd["price"]));
            if(this.order && this.order.hasOwnProperty("discount")){
              let $discount = this.order["discount"];
              productItemAdd["discount"] = this.order["discount"];
              productItemAdd["total_after_discount"] = ($discount === 0) ? productItemAdd["total"] : (productItemAdd["total"] - (productItemAdd["total"] * ($discount / 100)));
            }
            productItemAdd["isAdd"] = true;
            this.itemsProductDetail.unshift(productItemAdd);
          }
          else {
            let productItemAlreadyAdd = this.itemsProductDetail.find(product=>product.id === productItemAddId);
            let indexItem = this.itemsProductDetail.indexOf(productItemAlreadyAdd);
            let itemTemp = JSON.parse(JSON.stringify(productItemAlreadyAdd));
            itemTemp["qty"] = Number(itemTemp['qty']) + 1;
            itemTemp["total"] = (parseInt(itemTemp["qty"]) * parseFloat(itemTemp["price"]));

            if(this.order && this.order.hasOwnProperty("discount")){
              let $discount = this.order["discount"];
              itemTemp["discount"] = this.order["discount"];
              itemTemp["total_after_discount"] = ($discount === 0) ? itemTemp["total"] : (itemTemp["total"] - (itemTemp["total"] * ($discount / 100)));
            }
            if(itemTemp.hasOwnProperty("isAdd")){
              itemTemp["isAdd"] = true;
            }
            this.$set(this.itemsProductDetail, indexItem, itemTemp);
          }

          this.$nextTick(() => {
            this.$refs['inputQty'+ productItemAdd.id].focus();
          });
        }
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
      updatedDataOfCurrentProduct(dataItem, item, fieldName){
        let data = this.itemsProductDetail.find(product => product.id === item.id);
        let discount = data.discount;
        if(fieldName === 'qty'){
         let itemTemp = JSON.parse(JSON.stringify(data));
         let index = this.indexWhere(this.itemsProductDetail, (product => product.id  === item.id));
         itemTemp.qty = parseInt(dataItem);
         itemTemp.total = (itemTemp.qty * parseFloat(itemTemp.price));
         itemTemp.total_after_discount = discount > 0 ? (itemTemp.total - ((itemTemp.total) * (discount / 100))) : itemTemp.total;

         this.$set(this.itemsProductDetail, index, itemTemp);
       }
       else if(fieldName === 'price'){
         let itemTemp = JSON.parse(JSON.stringify(data));
         let index = this.indexWhere(this.itemsProductDetail, (product => product.id  === item.id));
         itemTemp.price = parseFloat(dataItem);
         itemTemp.total = (itemTemp.qty * parseFloat(itemTemp.price));
         itemTemp.total_after_discount = discount > 0 ? (itemTemp.total - ((itemTemp.total) * (discount / 100))) : itemTemp.total;
         this.$set(this.itemsProductDetail, index, itemTemp);
       }
      },
      indexWhere(array, conditionFn) {
        const item = array.find(conditionFn)
        return array.indexOf(item)
      },
      hideInput(){
        this.selected = null;
      },

      /*****Edit order records*****/
      handleSubmit(bvModalEvent){
        bvModalEvent.preventDefault();
        this.onSubmitEditPayment();
      },
      async onSubmitEditPayment(){
        let self = this;
        let dataSubmit = {};
        dataSubmit.warehouse_id = self.$store.$cookies.get('storeItem');
        dataSubmit.customer_id = self.order.customer;
        dataSubmit.vat = self.order.vat;
        dataSubmit.discount = self.order.discount;
        dataSubmit.invoice_id = self.orderItemSelectEdit.invoice_id;
        dataSubmit.items = [];
        let subTotal = 0;
        let totalVat = 0;
        let priceAfterDiscount = 0;

        for (let index=0; index < self.itemsProductDetail.length ; index++){
          let item = self.itemsProductDetail[index];
          subTotal = subTotal + self.itemsProductDetail[index]["total"];
          dataSubmit.items.push({product_id : item["id"], sellprice : item["price"], quantity: item["qty"]});
        }
        dataSubmit.subtotal = subTotal;
        totalVat = (self.order.vat * subTotal);
        priceAfterDiscount = subTotal - (subTotal * ((this.order.discount / 100)));
        dataSubmit.grandtotal = (priceAfterDiscount + totalVat);

        self.$toast.info("Data starting submit").goAway(1500);
        if(self.orderItemSelectEdit.hasOwnProperty("order_id") && self.orderItemSelectEdit.order_id){
          self.$axios.put('/api/sale/' + self.orderItemSelectEdit.order_id, dataSubmit).then(function (response) {
            console.log(response);
           if(response.data.success === true){
             self.$nextTick(() => {
               self.$refs['edit-payment-form-modal'].hide();
             });
             self.getAllOrderData();
             self.$toast.success("Submit data successfully").goAway(2000);
           }
         })
          .catch(function (error) {
            self.$toast.error("getting data error ").goAway(2000);
            console.log(error);
          });
        }
      },
      onResetEditPayment(){
        this.productItemAdd = null;
      },
      /*******************End***********************/

      /*****Remove order records*****/
      openConfirmToRemoveOrder($item){
        this.orderItemSelectToRemoveId = $item["order_id"];
        this.tr_id_select = $item["tr_id"];
        this.$refs["confirm-remove-order-form-modal"].show();
      },
      async onSubmitToRemove(){
        let self = this;
        if(self.orderItemSelectToRemoveId){
          await self.$axios.delete('/api/sale/delete/' + self.orderItemSelectToRemoveId).then(function (response) {
            $("#tr-" + self.orderItemSelectToRemoveId).fadeOut(1000);
            self.$refs["confirm-remove-order-form-modal"].hide();
          }).catch(function (error) {
            console.log(error);
            self.$toast.error("getting data error ").goAway(2000);
          });
        }
      },
      onResetConfirm(){},
      /*******************End***********************/

      /*****Remove product item from list product in order records*****/
      removeProductFromListOfOrder(item, $eventTarget){
        let productFound = this.itemsProductDetail.find(productItem => productItem.id === item.id);
        let index = this.itemsProductDetail.indexOf(productFound);
        if(index > -1){
          this.itemsProductDetail.splice(index, 1);
        }
      },
      /*******************End***********************/
      viewDetail(row, index, $event){

      },
      updateCustomerSelected(customer){
        for(let k=0; k < this.customersList.length; k++){
          if(customer === this.customersList[k]["id"]){
            this.order.discount = (this.customersList[k]["discount"] * 100);
            this.updatedPriceInListDetailOrder(this.order.discount);
            break;
          }
        }
      },
      updatedPriceInListDetailOrder($discount){
        if(this.itemsProductDetail && this.itemsProductDetail.length > 0){
          for(let index =0; index < this.itemsProductDetail.length; index++){
            let productItem = this.itemsProductDetail[index];
            productItem["discount"] = $discount;
            productItem["total_after_discount"] = ($discount === 0) ? productItem["total"] : (productItem["total"] - (productItem["total"] * ($discount / 100)));
            this.itemsProductDetail[index] = productItem;
          }
         // this.items = this.cloneObject(this.itemsProductDetail);
        }
      },
      filterProduct(product_id){
        if(this.products && this.products.length > 0){
          for(let index=0; index < this.products.length; index++){
            if(product_id === this.products[index].id){
              return this.products[index];
            }
          }
        }
      },
      getFullDate(){
        let today = new Date();
        let dd = today.getDate();
        let mm = (today.getMonth() + 1); //January is 0!
        let day = (dd < 10) ? ("0" + dd) : dd;
        let month = (mm < 10) ? ("0" + mm) : mm;
        let yyyy = today.getFullYear();

        return (day + "/" + month + "/" + yyyy);
      },
      onResetPrint(){},
      onSubmitToPrint(){
        // this.$htmlToPaper("invoice-print-again", this.optionStyleHtmlToPaper);
        this.$htmlToPaper("invoice-print-pos-again", this.optionStyleHtmlToPaper);
      },

      filterOrderByParam($filteName, $paramFilter){
        let orders = [];
        let user = this.cloneObject(this.$store.$cookies.get('user'));

        if($paramFilter){
          if(this.orders && this.orders.length > 0){
            for (let index=0; index < this.orders.length; index++){
              let orderItem = {};
              if($filteName === "product"){
                let orderItemDetailData = this.filterOrderDetailData(this.orders[index], $paramFilter);
                if(orderItemDetailData && orderItemDetailData.hasOwnProperty("product_id")){
                  orderItem["customer"] = this.orders[index]["customers"]["name"];
                  orderItem["invoice_id"] = this.orders[index]["invoice_id"];

                  orderItem["discount"] = this.orders[index]["discount"];
                  orderItem["vat"] = this.orders[index]["vat"];
                  orderItem["sale_by"] = user.name;

                  let createdDate = new Date(this.orders[index]["created_at"]);
                  let dd = createdDate.getDate();
                  let mm = createdDate.getMonth() + 1;
                  let day = (dd < 10) ? ('0' + dd) : dd;
                  let month = (mm < 10) ? ('0' + mm) : mm;
                  let yyyy = createdDate.getFullYear();
                  orderItem["date"] = (day + "/" + month + "/" + yyyy);

                  orderItem["product_id"] = orderItemDetailData["product_id"];
                  orderItem["name"] = orderItemDetailData["name"];
                  orderItem["sale_price"] = orderItemDetailData["sale_price"];
                  orderItem["qty"] = orderItemDetailData["qty"];
                  orderItem["subtotal"] = (parseFloat(orderItemDetailData["sale_price"]) * orderItemDetailData["qty"]);
                  orderItem["grandtotal"] = (parseFloat(orderItem["subtotal"]) - (parseFloat(orderItem["subtotal"]) * (parseInt(orderItem["discount"]) / 100)));
                  orders.push(orderItem);
                }
              }
              else if($filteName === "customer") {

              }
            }
          }
          this.items = this.cloneObject(orders);
        }
        else {
          this.getAllOrderData();
        }

      },
      filterOrderDetailData(orderItem, $paramProductId){
        let orderDetailItemTemp = {};
          if(orderItem.hasOwnProperty("orderdetails") && orderItem["orderdetails"].length > 0){
              for(let indexOrderDetail =0; indexOrderDetail < orderItem["orderdetails"].length; indexOrderDetail++){
                  let orderDetailItem = orderItem["orderdetails"][indexOrderDetail];
                  if($paramProductId === orderDetailItem["product_id"]){
                      let product = this.filterProduct($paramProductId);
                      orderDetailItemTemp["product_id"] = $paramProductId;
                      orderDetailItemTemp["name"] = product["name"];
                      orderDetailItemTemp["sale_price"] = orderDetailItem["sellprice"];
                      orderDetailItemTemp["qty"] = parseInt(orderDetailItem["quantity"]);
                  }
              }
          }

          return orderDetailItemTemp;
      },

      filterDataByDate(filterDate){
        this.getAllOrderData(filterDate);
      },

      sumAllSaleProduct($data){
          let total = [];
          Object.entries($data).forEach(([key, val]) => {
              total.push(val.qty);
          });
          return total.reduce(function(total, num){ return total + num }, 0);
      },
      sumAllPriceSaleProduct($data){
        let total = [];
        Object.entries($data).forEach(([key, val]) => {
          total.push(val.grandtotal !== undefined ? parseFloat(val.grandtotal) : 0);
        });
        return total.reduce(function(total, num){ return total + num }, 0);
      },
      printFilterData(){
        this.$htmlToPaper("table-order", this.optionStyleHtmlToPaper);
      },
      selectionChangeProduct($obj){
        if($obj){
          let orders = [];
          let user = this.cloneObject(this.$store.$cookies.get('user'));
          if(this.orders && this.orders.length > 0) {
            for (let index = 0; index < this.orders.length; index++) {
              let orderItem = {};
              let orderItemDetailData = this.filterOrderDetailData(this.orders[index], $obj["value"]);
              if (orderItemDetailData && orderItemDetailData.hasOwnProperty("product_id")) {
                orderItem["customer"] = this.orders[index]["customers"]["name"];
                orderItem["invoice_id"] = this.orders[index]["invoice_id"];

                orderItem["discount"] = this.orders[index]["discount"];
                orderItem["vat"] = this.orders[index]["vat"];
                orderItem["sale_by"] = user.name;

                let createdDate = new Date(this.orders[index]["created_at"]);
                let dd = createdDate.getDate();
                let mm = createdDate.getMonth() + 1;
                let day = (dd < 10) ? ('0' + dd) : dd;
                let month = (mm < 10) ? ('0' + mm) : mm;
                let yyyy = createdDate.getFullYear();
                orderItem["date"] = (day + "/" + month + "/" + yyyy);

                orderItem["product_id"] = orderItemDetailData["product_id"];
                orderItem["name"] = orderItemDetailData["name"];
                orderItem["sale_price"] = orderItemDetailData["sale_price"];
                orderItem["qty"] = orderItemDetailData["qty"];
                orderItem["subtotal"] = (parseFloat(orderItemDetailData["sale_price"]) * orderItemDetailData["qty"]);
                orderItem["grandtotal"] = (parseFloat(orderItem["subtotal"]) - (parseFloat(orderItem["subtotal"]) * (parseInt(orderItem["discount"]) / 100)));
                orders.push(orderItem);
              }
            }
          }
        }
        else {
          this.getAllOrderData();
        }
        this.$forceUpdate();
      },
      selectionChangeCustomer($obj){
        if($obj){
          this.filterOrderDataByCustomer($obj["value"]);
        }
        else {
          this.getAllOrderData();
        }
        this.$forceUpdate();
      },
      async filterOrderDataByCustomer($customerId){
        let self = this;
        self.isLoading = true;
        self.items = [];
        await self.$axios.get('/api/saleByWarehouseAndUser/' + $customerId + "/" + self.$store.$cookies.get('storeItem')).then(function (response) {
          self.isLoading = false;
            if(response && response.hasOwnProperty('data') && response.data.hasOwnProperty("data")){
              self.orders = response.data.data;
              self.orderList = self.cloneObject(response.data.data);
              if(self.orders.length > 0){
                for(let indexOrder =0; indexOrder < self.orders.length; indexOrder++){
                  let orderItem = self.orders[indexOrder];
                  let date = "";
                  if(orderItem && orderItem.created_at){
                    date = moment(orderItem.created_at, "YYYY-MM-DD").format("DD/MM/YYYY").toString();
                  }

                  let customerItem = self.filterDataCustomerList(orderItem.customer_id);
                  let user = self.cloneObject(self.$store.$cookies.get('user'));
                  let itemData = [];
                  let grandtotal = 0;
                  let subtotal = 0;
                  let status_code = 'pending';

                  for(let indexOrderDetail =0; indexOrderDetail < orderItem.orderdetails.length; indexOrderDetail++){
                    let orderDetailItem = orderItem.orderdetails[indexOrderDetail];

                    subtotal = subtotal + (parseInt(orderDetailItem.quantity) * parseFloat(orderDetailItem["sellprice"]));
                    if(orderItem["discount"] > 0){
                      let totalItem = (parseInt(orderDetailItem.quantity) * parseFloat(orderDetailItem["sellprice"]));
                      grandtotal = grandtotal + (totalItem - ((parseFloat(orderItem["discount"]) / 100) * totalItem));
                    }
                    else {
                      grandtotal = grandtotal + (parseInt(orderDetailItem.quantity) * parseFloat(orderDetailItem["sellprice"]));
                    }
                  }

                  itemData["subtotal"] = subtotal.toFixed(2);
                  itemData["grandtotal"] = grandtotal.toFixed(2);
                  itemData["date"] = date;
                  itemData["order_id"] = orderItem.id;
                  itemData["sale_by"] = user.name;
                  if(customerItem){
                    itemData["customer"] = customerItem["name"];
                  }
                  itemData["invoice_id"] = orderItem["invoice_id"];
                  itemData["discount"] = (orderItem["discount"] > 0 ? orderItem["discount"] : 0);
                  itemData["vat"] = ((orderItem.hasOwnProperty("vat") && orderItem["vat"] > 0) ? (orderItem["vat"] * 100) : 0);
                  itemData["receive"] = orderItem["receive"];
                  itemData["status"] = (parseFloat(orderItem["receive"]) === parseFloat(itemData["grandtotal"])) ? "<div class=' badge badge-success badge-radius'>Completed</div>" : "<div class='badge badge-danger badge-radius'>Pending</div>";
                  if(parseFloat(itemData["receive"]) === grandtotal){
                    status_code = 'complete';
                  }
                  itemData["status_code"] = status_code;
                  self.items.push(itemData);
                  self.orderItemList.push(itemData);
                }
              }
            }
        }).catch(function (error) {
          console.log(error);
          self.$toast.error("getting data error ").goAway(2000);
        });
      },
      selectedStatusSale(status_select){
        this.items = this.orderItemList.filter(data=> data.status_code === status_select);
      },
      removeElement(){
        this.getAllOrderData();
        this.$forceUpdate();
      },
      searchData($filterName){
        if($filterName === "product"){
          this.isSearchByProduct = !this.isSearchByProduct;
          this.isSearchByCustomer = false;
          this.customer_select = {};
        }
        else if($filterName === "customer"){
          this.isSearchByCustomer = !this.isSearchByCustomer;
          this.isSearchByProduct = false;
          this.product_select = {};
        }
      },
      onChangerEvent($event, $classNameToShow, $classNameToHide, $ref = null) {
          $event.stopPropagation();
          $("." + $classNameToHide).hide();
          $("." + $classNameToShow).show();
          if($ref !== null){
            if($ref === 'inputQty'){
              this.$refs.inputQty.focus();
            }
            else if($ref === 'inputPrice'){
              this.$refs.inputPrice.focus();
            }
          }

      },

      onBlurEvent($event){
        $event.stopPropagation();
        $($event.target).hide();
        $($event.target).prev().show();

      },
      calculateToRiel($totalPriceAsUSD, $exchangeRate){
        let total = (parseFloat($totalPriceAsUSD) * parseFloat($exchangeRate));
        let fixedTotal = total.toFixed(2);
        let parts = fixedTotal.toString().split(".");
        const numberPart = parts[0];
        const decimalPart = parts[1];
        const thousands = /\B(?=(\d{3})+(?!\d))/g;
        return numberPart.replace(thousands, ",") + (decimalPart ? "." + decimalPart : "");
      },
  },
    mounted() {
      this.warehouse = this.$store.$cookies.get('storeItem');
      if(this.$store.$cookies.get('storeItem')){
        this.getListProduct(this.$store.$cookies.get('storeItem'));
      }
      this.getCustomerList();
      this.getWareHouseList();
      this.getAllOrderData();
    }
  }
</script>

<style scoped>
  .content-order-list{
    min-height: calc(100vh - 140px);
  }
  .table-transaction{
    display: inline-block;
    width: 100%;
    overflow: hidden;
    height: 100%;
  }
  .table-transaction .table-header{
    display:inline-block;
    overflow: hidden;
    width: 100%;
  }
  .table-transaction .table-header tr th{
    border-bottom: 1px solid #dee2e6;
    vertical-align: top;
    text-align: left;
    padding: 10px 9px;
  }

  .table-transaction .table-body{
    display: inline-block;
    overflow-y: scroll;
    width: 100%;
  }
  .max-height-50-vh{
    max-height: 50vh;
  }
  .max-height-57-vh{
    max-height: 57vh;
  }
  .table-transaction .table-body .table-body-tr{
    display: inline-block;
    width: 100%;
    overflow: hidden;
    border-bottom: 1px solid #dee2e6;
  }
  .table-transaction .table-body .table-body-tr .content-td{
    display: inline-block;
    overflow: hidden;
    border-bottom: none;
    border-top: none;
    padding: 10px 9px;
  }

  .style-content{
    display: inline-block;
    overflow: hidden;
    border-bottom: none;
    border-top: none;
    text-align: left;
  }
  .content{
    display: inline-block;
    overflow:hidden;
    width: 100%;
  }
  .content-search{
    width: 250px;
  }
  .content-detail{
    display: inline-block;
    overflow: hidden;
    margin-top: 10px;
    font-weight: bold;
    float: right;
    margin-right: 15px;
  }
  .content-table-scroll-stock{
    max-height: calc(100vh - 300px);
  }
  .content-table-data{
    display: inline-block;
    width: 100%;
    overflow-y: auto;
    max-height: calc(100vh - 255px);
  }
  @media print {
    @page {
      size: 57mm 200mm;
      margin-top: 5mm;
      margin-left: 5mm;
      margin-right: 5mm;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Times New Roman', sans-serif;
    }

    table {
      width: 100%;
    }

    tr {
      width: 100%;

    }

    h1 {
      text-align: center;
      vertical-align: middle;
    }

    #logo {
      width: 60%;
      text-align: center;
      -webkit-align-content: center;
      align-content: center;
      padding: 5px;
      /*margin: 2px;*/
      display: block;
      margin: 0 auto;
    }

    header {
      width: 100%;
      text-align: center;
      -webkit-align-content: center;
      align-content: center;
      vertical-align: middle;
    }

    .items thead {
      text-align: center;
    }

    .center-align {
      text-align: center;
    }

    .bill-details td {
      font-size: 10px;
    }

    .receipt {
      font-size: medium;
    }

    .items .heading {
      font-size: 10.5px;
      text-transform: uppercase;
      border-top:1px solid black;
      margin-bottom: 4px;
      border-bottom: 1px solid black;
      vertical-align: middle;
    }

    .items thead tr th:first-child,
    .items tbody tr td:first-child {
      width: 47%;
      min-width: 47%;
      max-width: 47%;
      word-break: break-all;
      text-align: left;
    }

    .items td {
      font-size: 11px;
      text-align: right;
      vertical-align: bottom;
    }

    .price::before {
      content: "\20B9";
      font-family: "Arial";
      text-align: right;
    }

    .sum-up {
      text-align: right !important;
    }
    .total {
      font-size: 11px;
      border-top:1px dashed black !important;
      border-bottom:1px dashed black !important;
    }
    .total.text, .total.price {
      text-align: right;
    }
    .total.price::before {
      content: "\20B9";
    }
    .line {
      border-top:1px solid black !important;
    }
    .heading.rate {
      width: 20%;
    }
    .heading.amount {
      width: 25%;
    }
    .heading.qty {
      width: 5%
    }
    p {
      padding: 1px;
      margin: 0;
    }
    section, footer {
      font-size: 10px;
    }
  }


</style>
