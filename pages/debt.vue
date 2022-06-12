<template>
  <b-container fluid class="bv-example-row">
    <div class="main-page-content">
      <div class="control-panel" style="display:none;">
        <div class="panel-top">
          <div class="content-panel-left" style="width: 20%;">
            <h3 class="head-title">អំពី ការទូទាត់ទឹកប្រាក់</h3>
          </div>
          <div class="content-panel-right content-panel-right-full-width" style="display: none; vertical-align: text-bottom; width: 80%;">
            <div class="float-right">
              <b-form-select  class="form-control input-content input-select-warehouse min-height-43-px" v-model="warehouse" :options="warehouses" @change="selectedWarehouse(warehouse)"></b-form-select>
            </div>
          </div>
        </div>
      </div>
      <div class="content-product content-order-list">
        <div class="content-container-with-border-bottom">
          <b-container>
            <b-row style="padding-top: 35px;">
              <b-col lg="4">
                <div class="card border-1 border-left-3 border-left-accent text-center mb-lg-0 card-border-class">
                  <div class="card-body">
                    <h4 class="h2 mb-0" style="margin-bottom: 10px !important;">3333</h4>
                    <div>
                      ទឹកប្រាក់ដែលបានទូទាត់ សម្រាប់ខែនេះ
                    </div>
                  </div>
                </div>
              </b-col>
              <b-col lg="4">
                <div class="card border-1 border-left-3 border-left-accent text-center mb-lg-0 card-border-class">
                  <div class="card-body">
                    <h4 class="h2 mb-0" style="margin-bottom: 10px !important;">2222</h4>
                    <div>
                      ទឹកប្រាក់ដែលត្រូវទូទាត់ ទាំងអស់ សម្រាប់ខែនេះ
                    </div>
                  </div>
                </div>
              </b-col>
              <b-col lg="4">
                <div class="card border-1 border-left-3 border-left-accent text-center mb-lg-0 card-border-class">
                  <div class="card-body">
                    <h4 class="h2 mb-0" style="margin-bottom: 10px !important;">3333</h4>
                    <div>
                      ទឹកប្រាក់នៅសល់ ដែលត្រូវទូទាត់ សម្រាប់ខែនេះ
                    </div>
                  </div>
                </div>
              </b-col>
            </b-row>
          </b-container>
        </div>
        <div class="content-container-no-border-bottom">
          <b-container style="margin-top: 20px;">
            <div class="display-inline-block full-with float-left" style="padding-bottom: 15px;">
              <div class="float-left" style="width: 50%">
                <div style="margin-right: 8px; display: inline-block;">
                  <div class="content-search min-height-43-px">
                    <multiselect
                      class="input-content content-multiple-select"
                      v-model="customer_select" :options="customerOptions"
                      track-by="name" label="name" :show-labels="false"
                      :placeholder="$t('label_search_by_customer')"
                      @select="selectionChangeCustomer"
                      @remove="removeElement"></multiselect>
                  </div>
                </div>
              </div>
              <div class="display-inline-block float-left" style="width: 49%;" >
                <div class="display-inline-block float-right" style="margin-bottom: 10px;">
                  <label class="font-weight-bold font-size-16">បញ្ចូលចំនួនលុយត្រូវសង : </label>
                  <b-form-select class="form-control input-content min-height-43-px display-inline-block width-163-px" style="width: auto;" v-model="paymentMethod" :options="paymentMethodOption"></b-form-select>
                </div>
                <div class="display-inline-block float-right" v-if="paymentMethod">
                  <div class="display-inline-block" v-if="customer_select">
                    <label class="font-weight-bold font-size-16">បញ្ចូលចំនួនលុយត្រូវសង : </label>
                    <b-form-input type="number" class="form-control min-height-43-px display-inline-block width-163-px" style="width: auto;" v-model="payment"></b-form-input>
                    <span class="text-danger" v-if="checkingPaymentInput() && payment > 0 && isSubmit === false">មិនអាចបញ្ចូលចំនួនលើស</span>
                  </div>
                </div>
                <div class="display-inline-block float-right" style="width: 45%; margin-top: 10px;">
                  <div class="display-inline-block float-right" v-if="payment > 0 && isSubmit === false">
                    <b-button :disabled="checkingPaymentInput() && payment > 0 && isSubmit === false" class="min-height-43-px width-163-px" size="sm" title="រក្សារការទូទាត់" variant="success" @click="submitPayment()">រក្សារការទូទាត់</b-button>
                  </div>
                </div>
              </div>
            </div>
            <div class="content-loading" v-if="isLoading">
              <div class="spinner-grow text-muted"></div>
            </div>
            <div v-if="!isLoading">
              <div v-if="transactions && transactions.length > 0">
                <b-table
                  style="font-family: 'Arial', 'Khmer OS Bokor', sans-serif;"
                  table-class="table-product-detail"
                  :items="transactions"
                  :fields="fields"
                  striped hover
                ></b-table>
                <h3 class="text-danger">សរុបទឹកប្រាក់ត្រូវសង : {{ calulateTotal (transactions) + "($)"}}</h3>
              </div>
            </div>
          </b-container>
        </div>
      </div>
    </div>
  </b-container>
</template>
<script>
import {ValidationProvider} from "vee-validate";
import {getTypeOf} from "static/js/amcharts/plugins/export/libs/jszip/jszip";

export default {
  middleware: "local-auth",
  layout:'posui',
  components: {
    ValidationProvider
  },
  data(){
    return {
      warehouses : [{text : "ជ្រើសរើស ឃ្លាំងទំនិញ", value : null}],
      warehouse: null,
      isLoading: false,
      items : [],
      fields: [
        { key: 'customer', label: this.$t('label_customer_name')},
        {key: 'invoice_id', label: this.$t('label_number_invoice')},
        {key: 'paid', label: this.$t('label_paid')},
        {key : 'grandtotal', label: this.$t('label_grand_total')},
        // {key : 'status', label: this.$t('label_status')}
      ],
      customer_select : null,
      customerOptions: [],
      transactions: [],
      transactionList: [],
      customers : [],
      payment: 0,
      errors: [],
      total: 0,
      isSubmit: false,
      paymentMethodOption: [{text: "បង់លុយសុទ្ធ", value: "Cash"}, {text: "វេរតាម ធនាគារ ABA", value: "transfer_aba"}],
      paymentMethod: null
    }
  },
  methods: {
    async getListAllDebt($customerId){
      let self = this;
      await self.$axios.get('/api/transaction' + ($customerId ? "/" + $customerId : "")).then(function (response) {
        self.transactions = [];
        if(response.data.hasOwnProperty("data")){
          self.transactionList = self.cloneObject(response.data.data);
          let dataResponse = self.cloneObject(response.data.data);

          for(let index=0; index < dataResponse.length; index++){
            let item = self.cloneObject(dataResponse[index]);
            let dataItem = {"order_id": null,"customer": null,"invoice_id": null,"paid": 0,"grandtotal": 0};


            if(self.transactions && self.transactions.length > 0){
              let itemAlreadyAdd = self.transactions.find(order=> order.order_id === item.order_id);

              if(!itemAlreadyAdd){
                dataItem.order_id =  item["order_id"];
                dataItem.customer = item["customer"]["name"];
                dataItem.invoice_id = item["order"]["invoice_id"];
                dataItem.paid = parseFloat(item["paid"]) > 0 ? parseFloat(item["paid"]) : 0;
                dataItem.grandtotal = parseFloat(item["order"]["grandtotal"]) > 0 ? parseFloat(item["order"]["grandtotal"]) : 0;
                self.transactions.push(dataItem);
              }
              else if(itemAlreadyAdd) {
                if(
                  parseFloat(itemAlreadyAdd["grandtotal"]) === parseFloat(item["order"]["grandtotal"])
                  && (parseFloat(itemAlreadyAdd["paid"]) < parseFloat(item["paid"]))
                ){
                  let indexItem = self.transactions.indexOf(itemAlreadyAdd);
                  self.transactions.splice(indexItem, 1);

                  dataItem.order_id =  item["order_id"];
                  dataItem.customer = item["customer"]["name"];
                  dataItem.invoice_id = item["order"]["invoice_id"];
                  dataItem.paid = parseFloat(item["paid"]) > 0 ? parseFloat(item["paid"]) : 0;
                  dataItem.grandtotal = parseFloat(item["order"]["grandtotal"]) > 0 ? parseFloat(item["order"]["grandtotal"]) : 0;
                  if(parseFloat(item["order"]["grandtotal"]) > parseFloat(item["paid"])){
                    self.transactions.push(dataItem);
                  }
                }
                else if(parseFloat(itemAlreadyAdd["grandtotal"]) === parseFloat(item["order"]["grandtotal"])
                  && (parseFloat(itemAlreadyAdd["paid"]) === parseFloat(item["paid"]))
                  && (parseFloat(itemAlreadyAdd["grandtotal"]) === parseFloat(item["paid"]))
                ){
                  let indexItem = self.transactions.indexOf(itemAlreadyAdd);
                  self.transactions.splice(indexItem, 1);
                }
              }
            }
            else {
              dataItem.order_id =  item["order_id"];
              dataItem.customer = item["customer"]["name"];
              dataItem.invoice_id = item["order"]["invoice_id"];
              dataItem.paid = parseFloat(item["paid"]) > 0 ? parseFloat(item["paid"]) : 0;
              dataItem.grandtotal = parseFloat(item["order"]["grandtotal"]) > 0 ? parseFloat(item["order"]["grandtotal"]) : 0;
              self.transactions.push(dataItem);
            }
          }
          self.transactions.sort(self.compare);
          console.log(self.transactions);
        }
      }).catch(function (error) {
        self.$toast.error("getting data error ").goAway(2000);
        console.log(error);
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
    selectedWarehouse(warehouse){
      this.$emit('selectWarehouse', warehouse);
      if(warehouse){
        this.getListProduct(warehouse);
      }
    },
    selectionChangeCustomer($obj){
      if($obj){
        this.getListAllDebt($obj["value"]);
      }else {
        this.getListAllDebt();
      }
      this.$forceUpdate();
    },
    removeElement(){
      this.$forceUpdate();
    },
    cloneObject($obj){
      return JSON.parse(JSON.stringify($obj));
    },
    checkingPaymentInput(){
      if(this.transactions && this.transactions.length > 0){
        let paidArray = [];
        let receiveArray = [];
        let grandTotalArray = [];

        Object.entries(this.transactions).forEach(([key, val]) => {
          paidArray.push(parseFloat(val.paid));
        });
        Object.entries(this.transactions).forEach(([key, val]) => {
          receiveArray.push(parseFloat(val.receive));
        });

        Object.entries(this.transactions).forEach(([key, val]) => {
          grandTotalArray.push(parseFloat(val.grandtotal));
        });

        const totalPaidArray = paidArray.reduce(function(total, num) {
            return parseFloat((parseFloat(total) + parseFloat(num)).toFixed(2)) }
          , 0);

        const totalReceiveArray = receiveArray.reduce(function(total, num) {
            return parseFloat((parseFloat(total) + parseFloat(num)).toFixed(2)) }
          , 0);

        const totalGrandTotalArray = grandTotalArray.reduce(function(total, num) {
            return parseFloat((parseFloat(total) + parseFloat(num)).toFixed(2)) }
          , 0);

        const totalNeedPayment = parseFloat(totalGrandTotalArray) - (parseFloat(totalPaidArray) + parseFloat(totalReceiveArray));
        if(totalNeedPayment.toFixed(2) < parseFloat(this.payment).toFixed(2)){
          this.errors.push("មិនអាចបញ្ចូលចំនួនលើស");
        }
        return totalNeedPayment.toFixed(2) < parseFloat(this.payment).toFixed(2);
      }
    },
    async submitPayment(){
      let self = this;
      if(self.transactions && self.transactions.length > 0){
        if(self.payment > 0){
          let newTransactions = [];
          let payment = self.payment;

          for (let index=0; index < self.transactions.length; index++) {
            let order_id = self.transactions[index]["order_id"];
            let grandtotal = parseFloat(self.transactions[index]["grandtotal"]);
            let paid = parseFloat(self.transactions[index]["paid"]);

            let newTransactionItem = {"order_id": null, "paid": 0, "pay_method": "Cash"};
            newTransactionItem["order_id"] = order_id;
            newTransactionItem["pay_method"] = self.paymentMethod;

            if(payment > 0){
              let orderPayment = ((paid > 0) ? (grandtotal - paid) : grandtotal);
              let calculatePaid = (paid > 0 ? orderPayment.toFixed(2) : (orderPayment > 0 ? (parseFloat(payment) > grandtotal ? orderPayment.toFixed(2) : parseFloat(payment)) : 0));
              let total = parseFloat(calculatePaid).toFixed(2);
              console.log(typeof(total));
              newTransactionItem.paid = total;
              payment = (parseFloat(payment) - (parseFloat(payment) > 0 ? orderPayment : 0)).toFixed(2);
            }
            if(parseFloat(newTransactionItem.paid) > 0){
              newTransactions.push(newTransactionItem);
            }
          }
          self.isSubmit = true;
          if(newTransactions && newTransactions.length > 0){
            await self.$axios.post('/api/transaction', {transactions: newTransactions }).then(function (response) {
              self.$toast.success( "Submit data successfully").goAway(2000);
              console.log(response);
            }).catch(function (error) {
              self.$toast.error("getting data error ").goAway(2000);
              console.log(error);
            });
          }
        }
      }
    },
    compare(a, b) {
      if (parseFloat(a.grandtotal) > parseFloat(b.grandtotal)) return 1;
      if (parseFloat(a.grandtotal) < parseFloat(b.grandtotal)) return -1;
      return 0;
    },
    calulateTotal(transactions){
      if(transactions && transactions.length > 0){
        let paidArray = [];
        let receiveArray = [];
        let grandTotalArray = [];

        Object.entries(transactions).forEach(([key, val]) => {
          grandTotalArray.push(parseFloat(val.grandtotal));
        });
        Object.entries(transactions).forEach(([key, val]) => {
          paidArray.push(parseFloat(val.paid));
        });

        const totalGrandTotalArray = grandTotalArray.reduce(function(total, num) {
          return parseFloat(parseFloat(total) + parseFloat(num)).toFixed(2)
          }, 0);

        const totalPaidArray = paidArray.reduce(function(total, num) {
            return parseFloat(parseFloat(total) + parseFloat(num)).toFixed(2) }
          , 0);

        const totalNeedPayment = (parseFloat(totalGrandTotalArray) - parseFloat(totalPaidArray));
        return totalNeedPayment.toFixed(2);
      }
    }
  },
  mounted() {
    this.getCustomerList();
    this.getListAllDebt();
  }
}
</script>
