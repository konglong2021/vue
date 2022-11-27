<template>
  <div style="overflow-y:auto;max-height:650px;">
    <div style="padding-top:20px"></div>
    <b-form enctype="multipart/form-data">
      <div class="full-content">
        <div class="container-row-form width-45-percentage float-left">
          <div class="form-row-content-detail">
            <div class="form-column-label">
              <label :for="'input-customer'" class="label-input no-margin-bottom">ឈ្មោះអតិថិជន</label>
            </div>
            <div class="form-column-input">
              <b-form-select class="form-control input-content" v-model="order.customer" :options="customers"
                @change="selectCustomer(order.customer)"></b-form-select>
            </div>
          </div>
          <div class="form-row-content-detail">
            <div class="form-column-label">
              <label :for="'input-exchange-rate'" class="label-input no-margin-bottom">អត្រាប្តូរប្រាក់រៀល (៛)</label>
            </div>
            <div class="form-column-input">
              <b-form-input type="number" min="1000" step="50" class="input-content" v-model="exchangeRate">
              </b-form-input>
            </div>
          </div>
          <div class="form-row-content-detail">
            <div class="form-column-label">
              <label :for="'input-exchange-rate'" class="label-input no-margin-bottom">REFERENCE</label>
            </div>
            <div class="form-column-input">
              <b-form-input class="input-content" v-model="ref"></b-form-input>
            </div>
          </div>

        </div>
        <div class="container-row-form width-45-percentage float-right">
          <div class="form-row-content-detail">
            <div class="form-column-label">
              <label :for="'input-discount'" class="label-input no-margin-bottom">បញ្ចុះតម្លៃ(%)</label>
            </div>
            <div class="form-column-input">
              <b-form-input type="number" min="0" class="input-content" v-model="discount"></b-form-input>
            </div>
          </div>
          <div class="form-row-content-detail">
            <div class="form-column-label">
              <label :for="'input-vat'" class="label-input no-margin-bottom">ពន្ធ</label>
            </div>
            <div class="form-column-input">

              <b-form-select class="form-control input-content" v-model="vat" :options="vats"></b-form-select>

            </div>
          </div>

        </div>
      </div>
      <div>
        <div class="form-row-content-money pull-left">
          <div class="form-column-label">
            <label :for="'input-getting-money-usd'" class="label-input no-margin-bottom">ទទួលទឹកប្រាក់ ($)</label>
          </div>
          <div class="form-column-input">
            <b-form-input :id="'input-getting-money-usd'" type="number" class="input-content" min="0"
              @keyup="deleteInput($event)" v-model="gettingMoneyUsd"></b-form-input>
          </div>
        </div>
        <div class="form-row-content-money pull-left">
          <div class="form-column-label">
            <label :for="'input-getting-money-riel'" class="label-input no-margin-bottom">ទទួលទឹកប្រាក់ (៛)</label>
          </div>
          <div class="form-column-input">
            <b-form-input :id="'input-getting-money-riel'" type="number" min="0" class="input-content" step="100"
              v-model="gettingMoneyRiel"></b-form-input>
          </div>
        </div>
        <div style="clear:both"></div>
      </div>
      <div style="display: inline-block;margin-top: 25px;width: 90%;">
        <div class="total-wrapper pull-left">
          <div class="total">
            <div class="pull-left">
              {{ $t('title_total_no_tax') }} :
            </div>
            <div class="pull-right">
              {{$util.format(subTotal)}} USD
            </div>
          </div>
          <div style="clear:both"></div>
          <div class="total">
            <div class="pull-left">
              {{ $t('title_total_no_tax_add_discount') }} :
            </div>
            <div class="pull-right">
              {{ $util.format( subTotalWithDiscount) }} USD
            </div>
          </div>
          <div style="clear:both"> </div>

          <div class="total">
            <div class="pull-left">
              {{ $t('title_total_with_tax_usd') }}:
            </div>
            <div class="pull-right">
              {{$util.format(grandTotalUsd)}}
              USD
            </div>
          </div>
          <div style="clear:both"> </div>
          <div class="total">
            <div class="pull-left">
              {{ $t('title_total_with_tax_riel') }}:
            </div>
            <div class="pull-right">
              {{$util.format(grandTotalKh)}} Riel
            </div>
          </div>
          <div style="clear:both"> </div>
          <div class="line"></div>
          <div class="total" style="cursor:pointer" @click="inputReturn()">
            <div class="pull-left">
              លុយត្រូវអាប់ ($) :
            </div>
            <div class="pull-right">
              <div class="pull-left" v-if="showInputReturn">
                <b-form-input :id="'input-return-usd'" @keyup.enter="updateInputReturn()"
                  @keyup.esc="cancelInputReturn()" type="number" class="input-content" v-model="inputReturnUsd">
                </b-form-input>
              </div>
              <div class="pull-right" v-if="!showInputReturn">
                {{$util.format( returnMoneyUsd)}}
              </div>
              <div style="clear:both"></div>


            </div>
            <div style="clear:both"> </div>
          </div>
          <div class="total">
            <div class="pull-left">
              លុយត្រូវអាប់ (៛) :
            </div>
            <div class="pull-right">
              {{$util.format( returnMoneyKh)}}
            </div>
            <div style="clear:both;"></div>
          </div>
        </div>

        <div style="clear:both"></div>
        <div class="content-btn pull-left">
          <b-button class="btn-payment" v-show="showPrintReceipt" v-bind:disabled="printItems.length === 0"
            @click="printReceipt()">
            <i class="fa fa-print margin-span-btn font-size-28"></i>
            ព្រីន
          </b-button>
        </div>
        <div class="content-btn pull-right">
          <b-button class="btn-payment" v-bind:disabled="products.length === 0" @click="submitPayment()">
            <i class="fa fa-money margin-span-btn font-size-28"></i>
            ទូទាត់
          </b-button>
        </div>
      </div>
    </b-form>

    <div id="pos-invoice"
      style="display: none; height: 100%; overflow: hidden; padding: 30px 70px !important; font-family: 'Arial', 'Khmer', sans-serif !important; width: 95%; margin: 15px;">
      <div style="margin-bottom: 30px; font-family: 'Arial', 'Khmer', sans-serif; display:inline-block">
        <h1 style="font-family: 'Arial', 'Khmer', sans-serif; text-align: center;">{{ $t('title') }}</h1>
      </div>
      <div class="full-content">
        <div class="container-row-form width-60-percentage float-left">
          <div class="form-row-content-detail row-content-view" v-if="invoiceNumber">
            <label class="label-input no-margin-bottom"
              style="font-family: 'Arial', 'Khmer', sans-serif;">វិក័យប័ត្រលេខ</label>
            <strong class="input-content" style="font-family: 'Arial', 'Khmer', sans-serif;">{{invoiceNumber}}</strong>
          </div>
          <div class="form-row-content-detail row-content-view">
            <label :for="'input-customer'" class="label-input no-margin-bottom"
              style="font-family: 'Arial', 'Khmer', sans-serif;">ឈ្មោះអតិថិជន : </label>
            <strong class="input-content"
              style="font-family: 'Arial', 'Khmer', sans-serif;">{{displayCustomerName(order.customer)}}</strong>
          </div>
          <div class="form-row-content-detail row-content-view">
            <label :for="'input-exchange-rate'" class="label-input no-margin-bottom"
              style="font-family: 'Arial', 'Khmer', sans-serif;">អត្រាប្តូរប្រាក់រៀល : </label>
            <strong class="input-content" style="font-family: 'Arial', 'Khmer', sans-serif;"> {{ exchangeRate +
            "(៛)"}}</strong>
          </div>
          <div class="form-row-content-detail row-content-view">
            <label :for="'input-exchange-rate'" class="label-input no-margin-bottom"
              style="font-family: 'Arial', 'Khmer', sans-serif;">លក់ដោយ : </label>
            <strong class="input-content" style="font-family: 'Arial', 'Khmer', sans-serif;"> {{
            $store.$cookies.get('user').name }}</strong>
          </div>
        </div>
        <div class="container-row-form width-29-percentage float-right">
          <div class="form-row-content-detail row-content-view">
            <label :for="'input-vat'" class="label-input no-margin-bottom"
              style="font-family: 'Arial', 'Khmer', sans-serif;">ពន្ធ : </label>
            <strong class="input-content" style="font-family: 'Arial', 'Khmer', sans-serif;"> {{ order.vat !== 0 ?
            (order.vat * 100) + "%": 0 }}</strong>
          </div>
          <div class="form-row-content-detail row-content-view">
            <label :for="'input-discount'" class="label-input no-margin-bottom"
              style="font-family: 'Arial', 'Khmer', sans-serif;">បញ្ចុះតម្លៃ : </label>
            <strong class="input-content" style="font-family: 'Arial', 'Khmer', sans-serif;"> {{ order.discount + "%"
            }}</strong>
          </div>
          <div class="form-row-content-detail row-content-view">
            <label :for="'input-exchange-rate'" class="label-input no-margin-bottom"
              style="font-family: 'Arial', 'Khmer', sans-serif;">ថ្ងៃខែឆ្នាំលក់ : </label>
            <strong class="input-content" style="font-family: 'Arial', 'Khmer', sans-serif;"> {{ getFullDate()
            }}</strong>
          </div>
          <div class="form-row-content-detail row-content-view">
            <label :for="'input-exchange-rate'" class="label-input no-margin-bottom"
              style="font-family: 'Arial', 'Khmer', sans-serif;">REFERENCE </label>
            <strong class="input-content" style="font-family: 'Arial', 'Khmer', sans-serif;"> {{ order.ref }}</strong>
          </div>
        </div>
      </div>
      <b-table style="font-family: 'Arial', 'Khmer', sans-serif;" table-class="table-payment" :items="printItems"
        :fields="fieldsPos" :per-page="0" :current-page="1" stacked="md" show-empty small></b-table>
      <div style="display: inline-block;float: right; margin-top: 25px; margin-right: 75px;">
        <span style="display: block; font-family: 'Arial', 'Khmer', sans-serif;">{{$t('title_total_in_usd')}} :
          {{subTotalPrint}} USD</span>
        <span style="display: block;margin-top: 10px; font-family: 'Arial', 'Khmer', sans-serif;">
          {{$t('title_total_after_vat_in_usd')}} {{ $util.format(grandTotalUsdPrint)}} : USD</span>
        <span style="display: block;margin-top: 10px; font-family: 'Arial', 'Khmer', sans-serif;"
          v-if="exchangeRate">{{$t('title_total_in_riel')}} : {{ $util.format(grandTotalKhPrint)}} Riel</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    products: [],
    warehouseSelectedId: null,
    cashBalance: 0
  },
  computed: {
    subTotal() {
      var sub_total = 0.0;
      for (let inx in this.products) {
        let p = this.products[inx];
        sub_total += p.price * p.qty;
      }
      return sub_total;
    },
    subTotalWithDiscount() {
      let discount = parseFloat(this.discount);
      if (isNaN(discount)) discount = 0.0;
      return this.subTotal - this.subTotal * (discount / 100.0);
    },
    grandTotalUsd() {
      let total = this.subTotalWithDiscount;
      let taxValue = total * this.vat;
      return total + taxValue;

    },
    grandTotalKh() {
      return this.roundKhMoney(this.grandTotalUsd * this.exchangeRate);
    },
    subTotalPrint() {
      var subTotal = 0;
      for (let inx in this.printItems) {
        let p = this.printItems[inx];
        subTotal += p.price * p.qty;
      }
      return subTotal;
    },
    subTotalWithDiscountPrint() {
      let discount = parseFloat(this.discount);
      if (isNaN(discount)) discount = 0.0;
      return this.subTotalPrint - this.subTotalPrint * (discount / 100.0);
    },
    grandTotalUsdPrint() {
      let total = this.subTotalWithDiscountPrint;
      let taxValue = total * this.vat;
      return total + taxValue;
    },
    grandTotalKhPrint() {
      return this.roundKhMoney(this.grandTotalUsdPrint * this.exchangeRate);
    },


  },
  watch: {
    grandTotalKh(newVal, oldVal) {
      this.gettingMoneyUsd = 0;
      this.gettingMoneyRiel = 0;
    },
    gettingMoneyRiel(newVal, oldVal) {
      console.log(newVal, ' ->', oldVal);
      if (this.products.length == 0) {
        this.gettingMoneyUsd = 0;
      }


      this.updateReturnMoney();
    },
    gettingMoneyUsd(newVal, oldVal) {
      if (this.products.length == 0) {
        this.gettingMoneyUsd = 0;
      }
      this.updateReturnMoney();
    }
  },
  methods:
  {

    cancelInputReturn() {
      this.showInputReturn = false;
      this.inputReturnUsd = this.returnMoneyUsd;
    },

    roundKhMoney(num) {
      if (num % 100 > 0) {
        let plus = 100 - num % 100;
        return num + plus;
      }
      return num;
    },


    updateInputReturn() {

      this.showInputReturn = false;
      this.returnMoneyUsd = parseFloat(this.inputReturnUsd);
      let getting = this.gettingMoney();
      let remain = getting - this.grandTotalUsd;
      if (remain - this.returnMoneyUsd > 0) {
        let kh = (remain - this.returnMoneyUsd) * this.exchangeRate;
        this.returnMoneyKh = this.$util.roundKhDown(kh);
      }


    },
    inputReturn() {
      if (!this.showInputReturn) {
        this.showInputReturn = true;
        this.inputReturnUsd = this.returnMoneyUsd;
      }
    },
    gettingMoney() {
      let gettingUsd = parseFloat(this.gettingMoneyUsd);
      let gettingKh = parseFloat(this.gettingMoneyRiel);
      if (isNaN(gettingUsd)) {
        gettingUsd = 0.0;
        this.gettingMoneyUsd = 0.0;
      }
      if (isNaN(gettingKh)) {
        this.gettingMoneyRiel = 0.0;
        gettingKh = 0.0;
      }
      let exchangeRate = parseInt(this.exchangeRate);
      if (isNaN(exchangeRate)) {
        exchangeRate = 4100;
        this.exchangeRate = 4100;
      }

      let getting = gettingUsd + gettingKh / exchangeRate;
      return getting;
    },
    updateReturnMoney() {

      this.returnMoneyKh = 0.0;
      this.returnMoneyUsd = 0.0;
      let getting = this.gettingMoney();
      let remain = 0;
      if (getting > this.grandTotalUsd) {
        remain = getting - this.grandTotalUsd;
        if (!this.$util.isInt(remain)) {
          let num = parseInt(remain);
          let extra = remain - num;
          this.returnMoneyKh = this.$util.roundKhDown(extra * this.exchangeRate);
          this.returnMoneyUsd = num;
        }
        else {
          this.returnMoneyUsd = remain;
        }
      }

    },
    displayCustomerName(customerId) {
      if (this.customerMap[customerId]) {
        let customer = this.customerMap[customerId];
        return customer.name;
      }
      return '';
    },
    deleteInput($event) {
      console.log('delete input', $event);
    },

    buildPrintItems() {
      this.printItems = [];
      for (var i in this.products) {
        let p = this.products[i];
        const total = (parseFloat(p.price) * parseInt(p.qty));
        let item = {
          total: total,
          name: p.name,
          qty: p.qty,
          price: p.price
        };
        this.printItems.push(item);
      }

    },
    printReceipt() {
      const self = this;
      this.$nextTick(function () {
        self.$htmlToPaper("pos-invoice", this.optionStyleHtmlToPaper);
        self.showPrintReceipt = false;
      });

    },
    async submitPayment() {

      let self = this;
      let getting = this.gettingMoney();
      if (getting < this.grandTotalUsd) {
        let message = self.$t('not_enough_money');
        message = message + " ( " + this.$util.format(this.grandTotalUsd - getting) + " USD ) ";
        self.$toast.error(message).goAway(2000);
      }

      let dataSubmit = {};
      dataSubmit.customer_id = self.order.customer;
      dataSubmit.vat = self.vat;
      dataSubmit.warehouse_id = this.$store.$cookies.get('storeItem');
      dataSubmit.items = [];
      for (let index = 0; index < self.products.length; index++) {
        let item = self.products[index];
        dataSubmit.items.push({ product_id: item["id"], sellprice: item["price"], quantity: item["qty"] });
      }
      dataSubmit.subtotal = self.subTotal;
      dataSubmit.receive = self.gettingMoney();
      dataSubmit.sub_total_with_discount = self.subTotalWithDiscount;
      dataSubmit.grandtotal = self.grandTotalUsd;
      dataSubmit.kh_grandtotal = self.grandTotalKh;
      dataSubmit.receive_money_usd = self.gettingMoneyUsd;
      dataSubmit.receive_money_kh = self.gettingMoneyRiel;
      dataSubmit.return_money_kh = self.returnMoneyKh;
      dataSubmit.return_money_usd = self.returnMoneyUsd;
      dataSubmit.exchange_rate = self.exchangeRate;
      dataSubmit.discount = self.discount;
      dataSubmit.ref = self.ref;
      this.buildPrintItems();
      await this.$axios.post('/api/sale', dataSubmit).then(function (response) {
        if (response.data.success === true) {
          self.$toast.success("Submit data successfully").goAway(2000);
          self.invoiceNumber = response.data.order["invoice_id"];
          self.showPrintReceipt = true;
          self.$emit("updateListProduct", []);
          self.order = dataSubmit;
          self.ref = '';
          self.discount = 0.0;

        }
      })
        .catch(function (error) {
          self.$toast.error("getting data error ").goAway(2000);
          console.log(error);
        });
    }
    ,
    getFullDate() {
      let today = new Date();
      let dd = today.getDate();
      let mm = (today.getMonth() + 1); //January is 0!
      let day = (dd < 10) ? ("0" + dd) : dd;
      let month = (mm < 10) ? ("0" + mm) : mm;
      let yyyy = today.getFullYear();

      return (day + "/" + month + "/" + yyyy);
    },

    async getCustomerList() {
      let self = this;
      await self.$axios.get('/api/customer').then(function (response) {
        if (response.hasOwnProperty("data") && response.data.hasOwnProperty("customer")) {
          self.customerMap = {};
          for (let index = 0; index < response.data.customer.length; index++) {
            let customer = response.data.customer[index];
            self.customers.push({ text: customer["name"], value: customer["id"] });
            self.customerMap[customer["id"]] = customer;
          }

          for (let k = 0; k < response.data.customer.length; k++) {
            let customer = response.data.customer[k];
            if (customer["title"] === "Normal Member") {
              self.order.customer = customer["id"];
              self.order.discount = customer["discount"];//assign discount;
              break;
            }
          }
        }
      })
        .catch(function (error) {
          self.$toast.error("getting data error ").goAway(2000);
          console.log(error);
        });
    },

    selectCustomer(customer) {
      if (this.customerMap[customer]) {

      }
    },

  },

  mounted() {
    this.getCustomerList();
    console.log(this.$util.format(2020));
  },
  data() {
    return {
      optionStyleHtmlToPaper: {
        specs: [
          'fullscreen=yes',
          'titlebar=yes',
          'scrollbars=yes'
        ],
        styles: [
          'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
          'https://unpkg.com/kidlat-css/css/kidlat.css',
          // '~/static/css/app.css',
        ],
        autoClose: true,
      },
      fieldsPos: [
        { key: 'name', label: 'ឈ្មោះទំនិញ', thClass: "header-th", thStyle: "font-size: 17px;" },
        { key: 'qty', label: 'ចំនួន', thClass: "header-th", thStyle: "font-size: 17px;" },
        { key: 'price', label: 'តម្លៃឯកតា ($)', thClass: "header-th", thStyle: "font-size: 17px;" },
        { key: 'total', label: 'តម្លៃសរុប ($)', thClass: "header-th", thStyle: "font-size: 17px;" },
      ],
      showPrintReceipt: false,
      is_show_content_print: false,
      invoiceNumber: '',
      showInputReturn: false,
      inputReturnUsd: 0.0,
      returnMoneyUsd: 0.0,
      returnMoneyKh: 0.0,
      exchangeRate: 4100,
      categories: [],
      searchInput: null,
      scanningInput: null,
      productLoading: false,
      warehouses: [{ text: "ជ្រើសរើស ឃ្លាំងទំនិញ", value: null }],
      warehouse: null,
      searchInputData: null,
      customers: [],
      discount: 0.0,
      vat: 0.0,
      ref: '',
      order: {
        vat: 0,
        distcount: 0
      },
      vats: [{ text: '0%', value: 0 }, { text: '5%', value: 0.05 }, { text: '10%', value: 0.1 }, { text: '15%', value: 0.15 }],
      gettingMoneyUsd: 0,
      gettingMoneyRiel: 0,
      customerMap: {},
      printItems: [

      ],

    }
  }
}
</script>
<style scoped>
.total {
  font-weight: bold;
  font-size: 13px;
  border-bottom: 1px solid #ccc;
  padding: 2px 0px;
  width: 100%;
  display: inline-block;
}

.total-wrapper {
  width: 100%;
}

.form-row-content-money input {
  height: 30px;
  font-size: 20px;
  width: 100%;
}

.form-row-content-money label {
  font-size: 20px;
  min-width: 200px !important;
}

.form-row-content-money .form-column-label {
  min-width: 200px !important;
}

.line {
  margin: 1px 0px;
  padding: 5px 0px;
  border-bottom: 2px solid #000;
}

.btn-payment {
  width: 200px;
  height: 100px;
  font-size: 30px;
  color: #fff;
  background: #000;
  padding: 10px;
  border-radius: 30px;
  margin-top: 10px;
}

.btn-payment i {
  font-size: 40px !important;
}
</style>
