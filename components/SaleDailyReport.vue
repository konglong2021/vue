<template>
  <div>
    <div class="card">
      <div class="card-body">
        <div class="d-flex align-items-center">
            <div class="table-responsive mt-3">
              <table class="table align-middle mb-0">
                <thead class="table-light">
                <tr>
                  <th v-for="head in fieldsProductDetail"> {{ head.label }}</th>
<!--                  <th>Product</th>-->
<!--                  <th>Photo</th>-->
<!--                  <th>Product ID</th>-->
<!--                  <th>Status</th>-->
<!--                  <th>Amount</th>-->
<!--                  <th>Date</th>-->
<!--                  <th>Shipping</th>-->
                </tr>
                </thead>
                <tbody><tr>
                  <td>Sport Shoes</td>
                  <td><img src="assets/images/products/01.png" class="product-img-2" alt="product img"></td>
                  <td>#9405822</td>
                  <td><span class="badge bg-light-success text-success w-100">Paid</span></td>
                  <td>$1250.00</td>
                  <td>03 Feb 2020</td>
                  <td><div class="progress" style="height: 5px;">
                    <div class="progress-bar bg-success" role="progressbar" style="width: 100%"></div>
                  </div>
                  </td>
                </tr>

                <tr>
                  <td>Man Headcap</td>
                  <td><img src="assets/images/products/02.png" class="product-img-2" alt="product img"></td>
                  <td>#8304620</td>
                  <td><span class="badge bg-light-warning text-warning w-100">Pending</span></td>
                  <td>$1500.00</td>
                  <td>05 Feb 2020</td>
                  <td><div class="progress" style="height: 5px;">
                    <div class="progress-bar bg-warning" role="progressbar" style="width: 60%"></div>
                  </div></td>
                </tr>

                <tr>
                  <td>Sunglass</td>
                  <td><img src="assets/images/products/03.png" class="product-img-2" alt="product img"></td>
                  <td>#4736890</td>
                  <td><span class="badge bg-light-danger text-danger w-100">Failed</span></td>
                  <td>$1400.00</td>
                  <td>06 Feb 2020</td>
                  <td><div class="progress" style="height: 5px;">
                    <div class="progress-bar bg-danger" role="progressbar" style="width: 70%"></div>
                  </div></td>
                </tr>

                <tr>
                  <td>Shirt Formal</td>
                  <td><img src="assets/images/products/04.png" class="product-img-2" alt="product img"></td>
                  <td>#8543765</td>
                  <td><span class="badge bg-light-success text-success w-100">Paid</span></td>
                  <td>$1200.00</td>
                  <td>14 Feb 2020</td>
                  <td><div class="progress" style="height: 5px;">
                    <div class="progress-bar bg-success" role="progressbar" style="width: 100%"></div>
                  </div></td>
                </tr>
                <tr>
                  <td>Black Coat Pant</td>
                  <td><img src="assets/images/products/06.png" class="product-img-2" alt="product img"></td>
                  <td>#9629240</td>
                  <td><span class="badge bg-light-warning text-warning w-100">Pending</span></td>
                  <td>$1500.00</td>
                  <td>18 Feb 2020</td>
                  <td><div class="progress" style="height: 5px;">
                    <div class="progress-bar bg-warning" role="progressbar" style="width: 60%"></div>
                  </div></td>
                </tr>
                <tr>
                  <td>Heals</td>
                  <td><img src="assets/images/products/05.png" class="product-img-2" alt="product img"></td>
                  <td>#8506790</td>
                  <td><span class="badge bg-light-danger text-danger w-100">Failed</span></td>
                  <td>$1800.00</td>
                  <td>21 Feb 2020</td>
                  <td><div class="progress" style="height: 5px;">
                    <div class="progress-bar bg-danger" role="progressbar" style="width: 40%"></div>
                  </div></td>
                </tr>
                </tbody>
              </table>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    warehouse: {
      type: String,
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
        {key: 'date', label: this.$t('label_date_sale'), thStyle : "font-size: 17px;"},
        { key: 'sale_by', label: this.$t('label_sale_by'), thStyle : "font-size: 17px;"},
        { key: 'customer', label: this.$t('label_customer_name'), thStyle : "font-size: 17px;"},
        { key: 'invoice_id', label: this.$t('label_number_invoice'), thStyle : "font-size: 17px;"},
        // { key: 'discount', label: this.$t('label_discount'), thStyle : "font-size: 17px;"},
        // { key: 'vat', label: this.$t('label_vat'), thStyle : "font-size: 17px;"},
        { key: 'name', label: 'ឈ្មោះទំនិញ', thClass: "header-th", thStyle : "font-size: 17px;"},
        { key: 'qty', label: 'ចំនួន', thClass: "header-th", thStyle : "font-size: 17px; width: 15%;"},
        { key: 'price', label: 'តម្លៃឯកតា ($)', thClass: "header-th", thStyle : "font-size: 17px;width: 15%;"},
        { key: 'total', label: 'តម្លៃសរុប ($)', thClass: "header-th" , thStyle : "font-size: 17px;"},
        { key: 'discount', label: 'បញ្ចុះតម្លៃ (%)', thClass: "header-th", thStyle : "font-size: 17px;"},
        { key: 'total_after_discount', label: 'តម្លៃសរុប បន្ទាប់ពី បញ្ចុះតម្លៃ ($)', thClass: "header-th", thStyle : "font-size: 17px;"},
        { key: 'action', label: this.$t('title_action'), thClass: "header-th", thStyle : "font-size: 17px;"},
      ],
      productSelectOptions: [],
      productOptions: [],
      products: []
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
                    let createdDate = new Date(orderDetailItem.created_at);
                    let dd = createdDate.getDate();
                    let mm = createdDate.getMonth() + 1;
                    let day = (dd < 10) ? ('0' + dd) : dd;
                    let month = (mm < 10) ? ('0' + mm) : mm;
                    let yyyy = createdDate.getFullYear();
                    itemOrderDetail["date"] = (day + "/" + month + "/" + yyyy);
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
                  itemData["grandtotal"] = orderItem["grandtotal"];
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
  },

  mounted() {
    this.getListProduct();
    this.getListOrders();
  }
}
</script>
