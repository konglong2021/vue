<template>
  <div>
    <div>
      <b-tabs
        active-nav-item-class="active-tab" style="display: inline-block; width: 100%; height: 100%;">
        <b-tab title="ការលក់" active >
          <div class="card">
            <div class="card-body">
              <sale-daily-report :isLoading="isLoading" :warehouse="warehouse" :orderItems="orderItems" :fieldsProductDetail="fieldsProductDetail" />
            </div>
          </div>
        </b-tab>
        <b-tab title="នាំចូលទំនិញ">
          <p>I'm the Purchase tab</p>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>
<script>
import moment from "moment";

export default {
  props: {
    warehouse: {
      type: Number,
      require: true
    },
    items: {
      type: false,
      require: false
    },
    fields: {
      type: Array,
      require: false
    },
  },
  data() {
    return {
      orderItems: [],
      fieldsProductDetail: [
        {key: 'date', label: this.$t('label_date_sale')},
        { key: 'sale_by', label: this.$t('label_sale_by')},
        { key: 'customer', label: this.$t('label_customer_name')},
        { key: 'invoice_id', label: this.$t('label_number_invoice')},
        { key: 'name', label: 'ឈ្មោះទំនិញ'},
        { key: 'qty', label: 'ចំនួន'},
        { key: 'sale_price', label: 'តម្លៃឯកតា ($)'},
        { key: 'subtotal', label: 'តម្លៃសរុប ($)'},
        { key: 'discount', label: this.$t('label_discount')},
        { key: 'total_after_discount', label: 'តម្លៃសរុបA.បញ្ចុះតម្លៃ ($)'},
      ],
      productSelectOptions: [],
      productOptions: [],
      products: [],
      customerOptions: [],
      customers: [],
      isLoading: false,
    }
  },
  watch:{
    warehouse: {
      handler(value){
        this.getListProduct((value === null ? "" : value));
      }
    }
  },
  methods: {
    async getListProduct($warehouse = null){
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
    async getListOrders(){
      let self = this;
      self.isLoading = true;
      self.orderItems = [];

      await self.$axios.get('/api/sale').then(function (response) {
        self.isLoading = false;
        if (response && response.hasOwnProperty("data")) {
          self.orders = response.data;
          self.orderList = self.cloneObject(response.data);
          let itemOrder = [];
          if(self.orders.length > 0){
            for(let indexOrder =0; indexOrder < self.orders.length; indexOrder++){
              let orderItem = self.orders[indexOrder];
              let customerItem = self.filterDataCustomerList(orderItem.customer_id);
              let user = self.cloneObject(self.$store.$cookies.get('user'));
              itemOrder[orderItem.id] = [];

              if(orderItem.hasOwnProperty("orderdetails") && orderItem.orderdetails.length > 0){
                for(let indexOrderDetail =0; indexOrderDetail < orderItem.orderdetails.length; indexOrderDetail++){
                  let itemOrderDetail = [];
                  let orderDetailItem = orderItem.orderdetails[indexOrderDetail];
                  let productData = self.filterProduct(orderDetailItem.product_id);
                  if(productData !== null && productData !== undefined){
                    itemOrderDetail["date"] = moment(orderDetailItem.created_at, "YYYY-MM-DD").format("DD/MM/YYYY").toString();
                    itemOrderDetail["name"] = productData["en_name"] + " (" + productData["kh_name"] + ")";
                    itemOrderDetail["en_name"] = productData["en_name"];
                    itemOrderDetail["kh_name"] = productData["kh_name"] ;
                    itemOrderDetail["product_id"] = productData["id"] ;
                    itemOrderDetail["qty"] = parseInt(orderDetailItem.quantity);
                    itemOrderDetail["sale_price"] = parseFloat(orderDetailItem["sellprice"]) ;
                    itemOrderDetail["order_id"] = orderDetailItem.order_id;
                    itemOrderDetail["tr_id"] = orderDetailItem.order_id;
                    let subtotal = 0;
                    if(orderItem["discount"] > 0){
                      let totalItem = (parseInt(orderDetailItem.quantity) * parseFloat(orderDetailItem["sellprice"]));
                      subtotal = totalItem - ((parseFloat(orderItem["discount"]) / 100) * totalItem);
                    }
                    else {
                      subtotal = (parseInt(orderDetailItem.quantity) * parseFloat(orderDetailItem["sellprice"]));
                    }
                    itemOrderDetail["subtotal"] = subtotal;
                    itemOrder[orderItem.id].push(itemOrderDetail);
                  }
                }
              }
              for(let index=0; index < itemOrder[orderItem.id].length; index++){
                let itemData = [];
                itemData["tr_id"] = itemOrder[orderItem.id].hasOwnProperty("tr_id") ? itemOrder[orderItem.id].tr_id : orderItem["id"];
                itemData["customer_id"] = orderItem["customer_id"];
                if(index === 0){
                  itemData["order_id"] = orderItem.id;
                  itemData["sale_by"] = user.name;
                  if(customerItem){
                    itemData["customer"] = customerItem["name"];
                  }
                  itemData["invoice_id"] = orderItem["invoice_id"];
                  itemData["discount"] = (orderItem["discount"] > 0 ? orderItem["discount"] : 0);
                  itemData["vat"] = ((orderItem.hasOwnProperty("vat") && orderItem["vat"] > 0) ? (orderItem["vat"] * 100) : 0);
                  itemData["lengthDetail"] = itemOrder[orderItem.id].length;
                  itemData["total_after_discount"] = orderItem["grandtotal"];
                  itemData["receive"] = orderItem["receive"];

                  itemData["product_id"] = itemOrder[orderItem.id][index].product_id;
                  itemData["name"] = itemOrder[orderItem.id][index].name;
                  itemData["qty"] = itemOrder[orderItem.id][index]["qty"];
                  itemData["sale_price"] = itemOrder[orderItem.id][index]["sale_price"];
                  itemData["date"] = itemOrder[orderItem.id][index]["date"];
                  itemData["subtotal"] = itemOrder[orderItem.id][index]["subtotal"];
                }
                else {
                  itemData["discount"] = (orderItem["discount"] > 0 ? orderItem["discount"] : 0);
                  itemData["product_id"] = itemOrder[orderItem.id][index].product_id;
                  itemData["name"] = itemOrder[orderItem.id][index].name;
                  itemData["qty"] = itemOrder[orderItem.id][index]["qty"];
                  itemData["sale_price"] = itemOrder[orderItem.id][index]["sale_price"];
                  itemData["subtotal"] = itemOrder[orderItem.id][index]["subtotal"];
                }
                self.orderItems.push(itemData);
              }
            }
          }
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
    filterProduct(product_id){
      if(this.products && this.products.length > 0){
        for(let index=0; index < this.products.length; index++){
          if(product_id === this.products[index].id){
            return this.products[index];
          }
        }
      }
    },
    cloneObject(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    generateImageUrlDisplay(img){
      if (typeof window !== "undefined") {
        if((img !== "no image" && img !== "no image created")){
          return (window.location.protocol + "//" + window.location.hostname + ":8000/" + "storage/img/" + img) ;
        }
      }
    },
    calculate(items){
      let total = [];
      Object.entries(items).forEach(([key, val]) => {
        total.push(val.grandtotal ? parseFloat(val.grandtotal) : 0) ;
      });
      return total.reduce(function(total, num){ return total + num }, 0);
    },
  },
  mounted() {
    if(this.$store.$cookies.get('storeItem')){
      this.getListProduct(this.$store.$cookies.get('storeItem'));
    }
    this.getCustomerList();
    this.getListOrders();
  }
}
</script>

<style scoped>
.active-tab{
  border-color: transparent;
  border-bottom: 2px solid #7c5cc4;
}
</style>
