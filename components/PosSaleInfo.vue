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
<!--          <div class="total" style="cursor:pointer" @click="inputReturn()">-->
          <div class="total" style="cursor:pointer">
            <div class="pull-left">
              លុយត្រូវអាប់ ($) :
            </div>
            <div class="pull-right">
<!--              <div class="pull-left" v-if="showInputReturn">-->
<!--                <b-form-input :id="'input-return-usd'" @keyup.enter="updateInputReturn()"-->
<!--                  @keyup.esc="cancelInputReturn()" type="number" class="input-content" v-model="inputReturnUsd">-->
<!--                </b-form-input>-->
<!--              </div>-->
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


    <div id="pos-invoice" style="padding-top : 50px; margin: 5px; display: none; width: 100%; height: 100%; overflow: hidden; font-family: 'Arial', 'Khmer OS Bokor', sans-serif !important;">
      <h6 class="text-center" style="margin-top: 35px; font-family: 'Arial', 'Khmer', sans-serif; font-size: 12px;">{{ $t('title') }}</h6>
      <table style="font-size: 10px; margin-bottom: 20px;">
        <tbody>
        <tr>
          <td style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; font-weight: 700; padding: 0;">វិក័យប័ត្រលេខ : {{invoiceNumber}}</td>
        </tr>
        <tr>
          <td style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; font-weight: 700; padding: 0;">ថ្ងៃខែឆ្នាំលក់ : {{ getFullDate() }}</td>
        </tr>
        <tr>
          <td style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; font-weight: 700; padding: 0;">លក់ដោយ : {{$store.$cookies.get('user').name }}</td>
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
        <tr v-for="item of printItems">
          <td style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px;">{{ item.name }}</td>
          <td style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px;">{{ item.qty }}</td>
          <td style="font-size: 10px; content: '\20B9';font-family: 'Arial';text-align: right;">{{ item.price }}</td>
          <td style="font-size: 10px; content: '\20B9';font-family: 'Arial';text-align: right;">{{ item.total }}</td>
        </tr>
        <tr>
          <td style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; border-top:1px solid black !important; text-align: right !important;" colspan="2">សរុបមុនបញ្ចូលពន្ធ ($)</td>
          <td style="font-size: 10px; text-align: right;content: '\20B9'; font-family: 'Arial'; border-top:1px solid black !important;" colspan="2">{{ subTotalPrint }}</td>
        </tr>
        <tr>
          <td colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; text-align: right !important;">ពន្ធ {{ (this.vat * 100) }} (%)</td>
          <td colspan="2" style="font-size: 10px; text-align: right;content: '\20B9'; font-family: 'Arial';">{{ vatPrint }} ($)</td>
        </tr>
        <tr>
          <td colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10px; text-align: right !important;">បញ្ចុះតម្លៃ {{ this.discountOder }} (%)</td>
          <td colspan="2" style="font-size: 10px; text-align: right;content: '\20B9'; font-family: 'Arial';">{{ discountPrint }} ($)</td>
        </tr>
        <tr>
          <th colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10.5px; border-top:1px dashed black !important; border-bottom:1px dashed black !important; text-align: right;">សរុបបញ្ចូលពន្ធបញ្ចុះតម្លៃ ($)</th>
          <th colspan="2" style="font-size: 13px; border-top:1px dashed black !important; border-bottom:1px dashed black !important; text-align: right;">{{ $util.format(grandTotalUsdPrint - this.discountPrint) }}</th>
        </tr>
        <tr>
          <th colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10.5px; border-top:1px dashed black !important; border-bottom:1px dashed black !important; text-align: right;">តម្លៃសរុប (៛)</th>
          <th colspan="2" style="font-size: 13px; border-top:1px dashed black !important; border-bottom:1px dashed black !important; text-align: right;">{{ $util.format(grandTotalKhPrint)}}</th>
        </tr>
        <tr>
          <th colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10.5px; border-top:1px dashed black !important; border-bottom:1px dashed black !important; text-align: right;">លុយត្រូវអាប់ ($)</th>
          <th colspan="2" style="font-size: 13px; border-top:1px dashed black !important; border-bottom:1px dashed black !important; text-align: right;">{{ grandTotalUsdPrint }}</th>
        </tr>

        <tr>
          <th colspan="2" style="font-family: 'Arial', 'Khmer', sans-serif; font-size: 10.5px; border-top:1px dashed black !important; border-bottom:1px dashed black !important; text-align: right;">លុយត្រូវអាប់ (៛)</th>
          <th colspan="2" style="font-size: 13px; border-top:1px dashed black !important; border-bottom:1px dashed black !important; text-align: right;">{{ $util.format(returnMoneyKh)}}</th>
        </tr>

        </tbody>
      </table>
      <footer style="font-family: 'Arial', 'Khmer', sans-serif; text-align:center; font-size: 10px; margin-top: 45px;">
        <p style="text-align:center; margin-bottom: 0; padding-bottom: 0;">ទំនិញទិញហើយ មិនអាចប្តុរជាទឹកប្រាក់វិញបានទេ</p>
        <p style="text-align:center; margin-bottom: 0; padding-bottom: 0; margin-top: 4px; padding-top: 0">អរគុណសម្រាប់ការគាំទ្រ</p>
      </footer>
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
    discountPrint() {
      let discount = parseFloat(this.discountOder);
      if (isNaN(discount)) discount = 0.0;
      const discountPrice = (this.subTotalPrint * (discount / 100.0));
      return discountPrice.toFixed(2);
    },
    vatPrint() {
      const vatPrint = (this.subTotalWithDiscountPrint * this.vat);
      return vatPrint.toFixed(2);
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
      return this.roundKhMoney((this.grandTotalUsdPrint - this.discountPrint) * this.exchangeRate);
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
        this.returnMoneyKh = 0.0;
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
  methods: {
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

      let getting = gettingUsd + (gettingKh / exchangeRate);
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
          this.returnMoneyKh = this.$util.roundKhDown(remain.toFixed(2) * this.exchangeRate);
          // this.returnMoneyKh = this.$util.roundKhDown(remain.toFixed(2) * 4000);
          this.returnMoneyUsd = remain;
          /*
          let num = parseInt(remain);
          let extra = remain - num;
          this.returnMoneyKh = this.$util.roundKhDown(extra * this.exchangeRate);
          this.returnMoneyUsd = num;
          */
        }
        else {
          this.returnMoneyUsd = remain;
          // this.returnMoneyKh = this.$util.roundKhDown(remain.toFixed(2) * 4000);
          this.returnMoneyKh = this.$util.roundKhDown(remain.toFixed(2) * this.exchangeRate);
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
      //console.log('delete input', $event);
    },

    buildPrintItems() {
      this.printItems = [];
      for (var i in this.products) {
        let p = this.products[i];
        const total = (parseFloat(p.price) * parseInt(p.qty));
        let item = {
          total: total,
          name: p.kh_name,
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
        dataSubmit.items.push({ product_id: item["product_id"], sellprice: item["price"], quantity: item["qty"] });
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
          self.$toast.success("ទិន្នន័យត្រូវបានរក្សាទុក ដោយជោគជ័យ!!").goAway(2000);
          self.invoiceNumber = response.data.order["invoice_id"];
          self.discountOder = parseFloat(response.data.order["discount"]);
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
          'titlebar=no',
          'scrollbars=no'
        ],
        styles: [
          '../static/css/invoice-print.css',
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
      discountOder : 0.0,
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
      printItems: [],
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
