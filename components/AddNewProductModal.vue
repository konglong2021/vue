<template>
    <div>
      <b-modal
        id="modal-create-product" ref="product-form-modal" size="lg"
        @hidden="onReset" cancel-title="បោះបង់"
        @ok="handleSubmit" ok-title="រក្សាទុក" title="បង្កើតទំនិញថ្មី"
        :ok-disabled="!product.brand || !product.category || !product.sale_price"
        no-close-on-backdrop
      >
        <b-form enctype="multipart/form-data" @submit.stop.prevent="onSubmit">
          <div class="full-content">
            <div class="content-file-upload">
              <b-form-file id="file" name="file" class="input-file" v-on:change="onFileChange" plain></b-form-file>
              <div id="output" v-if="uploadFile" class="img"></div>
              <div v-if="!uploadFile && (!product.image || product.image === 'no image' || product.image === 'no image created')" class="img" :style="{ backgroundImage: `url('images/image.png')` }"></div>
              <div v-if="!uploadFile && (product.image || product.image !== 'no image' || product.image !== 'no image created')" class="img" :style="{ backgroundImage: `url('${generateImageUrlDisplay(product.image)}')` }"></div>
            </div>
          </div>
          <div class="full-content">
            <b-row>
              <b-col sm="12">
                <div v-if="errors.length">
                  <b class="text-danger">បញ្ចូលទិន្នន័យទាំងអស់!!!!!:</b>
                </div>
              </b-col>
            </b-row>
            <b-row class="my-1">
              <b-col sm="4"><label :for="'input-enname'" class="label-input">ឈ្មោះទំនិញជាអង់គ្លេស</label></b-col>
              <b-col sm="8">
                <b-form-input :id="'input-enname'" type="text" v-model="product.en_name" class="input-content" required></b-form-input>
              </b-col>
            </b-row>
            <b-row class="my-1">
              <b-col sm="4"><label :for="'input-khname'" class="label-input">ឈ្មោះទំនិញជាខ្មែរ</label></b-col>
              <b-col sm="8">
                <b-form-input :id="'input-khname'" type="text" v-model="product.kh_name" class="input-content" required></b-form-input>
              </b-col>
            </b-row>
            <b-row class="my-1">
              <b-col sm="4"><label :for="'input-code'" class="label-input">លេខកូដទំនិញ</label></b-col>
              <b-col sm="8">
                <b-form-input :id="'input-code'" type="text" v-model="product.code" class="input-content" required></b-form-input>
              </b-col>
            </b-row>
            <b-row class="my-1">
              <b-col sm="4"><label :for="'input-category'" class="label-input">ប្រភេទទំនិញ</label></b-col>
              <b-col sm="8">
                <b-form-select
                  :id="'input-category'" class="form-control input-content"
                  v-model="product.category" :options="categories" required></b-form-select>
              </b-col>
            </b-row>
            <b-row class="my-1">
              <b-col sm="4"><label :for="'input-brand'" class="label-input">ប្រេនទំនិញ</label></b-col>
              <b-col sm="8">
                <multiselect class="input-content"
                             v-model="product.brand" :options="brands"
                             track-by="name" label="name" :show-labels="false"
                             :multiple="true" aria-placeholder="Select brands"
                             @select="selectionChange"
                             @remove="removeElement"></multiselect>
              </b-col>
            </b-row>
            <b-row class="my-1">
              <b-col sm="4"><label :for="'input-brand'" class="label-input">ឃ្លាំងទំនិញ</label></b-col>
              <b-col sm="8">
                <b-form-select class="form-control input-content input-select-warehouse" v-model="product.warehouse" :options="warehouseOption"
                ></b-form-select>
              </b-col>
            </b-row>
            <b-row class="my-1">
              <b-col sm="4"><label :for="'input-sale_price'" class="label-input">តម្លៃលក់ ($)</label></b-col>
              <b-col sm="8">
                <b-form-input :id="'input-sale_price'" type="number" class="input-content" v-model="product.sale_price" required></b-form-input>
              </b-col>
            </b-row>
            <b-row class="my-1">
              <b-col sm="4"><label :for="'input-description'" class="label-input">ការពិពណ៌នា</label></b-col>
              <b-col sm="8">
                <b-form-textarea :id="'input-description'" class="input-content" v-model="product.description" required></b-form-textarea>
              </b-col>
            </b-row>
          </div>
        </b-form>
      </b-modal>
    </div>
</template>

<script>
  export default {
    props:{
      'value':{
        type:Object,
        require:true
      },
      productItemSelected: {
        type:Object,
        require:false
      },
      warehouseList:{
        type:Array,
        require:true
      },
      warehouseOption:{
        type:Array,
        require:true
      }
    },
    data() {
      return {
        categories: [{text: "Select category", value: null}],
        brands: [],
        product: {
          en_name: '',
          kh_name: '',
          category: null,
          brand: null,
          description: '',
          image: null,
          sale_price: 0,
          code: null,
          warehouse: null,
        },
        uploadFile: null,
        file: null,
        errors: [],
        categoriesList: [],
        brandList: [],
        warehouseDefault : this.$store.$cookies.get('storeItem'),
      };
    },
    watch:{
      'value.showModal':{
         //watch value change sent from parent component
         handler(value){
           if(value===true){
             this.$refs['product-form-modal'].show();
             this.getBrands();
             this.getCategories();
           }
         },
         deep:true
      },
      productItemSelected: {
        deep: true,
        handler: function(selectedProduct){
          this.product = selectedProduct;
        }
      }
    },
    mounted(){
    },
    methods: {
      checkForm: function (e) {
        this.errors = [];

        if (!this.product.category) {
          this.errors.push("categor required.");
        }
        if (!this.product.en_name) {
          this.errors.push('English name required.');
        }
        if (!this.product.kh_name) {
          this.errors.push('Khmer name required.');
        }
        if (!this.product.kh_name) {
          this.errors.push('Khmer name required.');
        }
        if (!this.product.sale_price) {
          this.errors.push('Selling price required.');
        }
        if (!this.product.description) {
          this.errors.push('Description required.');
        }

        if (!this.errors.length) {
          return true;
        }
        e.preventDefault();
      },
      async getBrands(){
        let vm = this;
        vm.brands = [];
        await vm.$axios.get('/api/brand')
          .then(function (response) {
            if(response.data.brands){
              for(let index=0; index < response.data.brands.length; index++){
                vm.brandList.push(response.data.brands[index]);
                vm.brands.push({name : response.data.brands[index]["name"], value : response.data.brands[index]["id"]});
              }
            }
          }).catch(function (error) {
            vm.$toast.error("getting data error ").goAway(2000);
            console.log(error);
          });
      },
      async getCategories(){
        let vm = this;
        vm.categories = [];
        vm.$axios.get('/api/category')
          .then(function (response) {
            if(response.data.data){
              for(let index=0; index < response.data.data.length; index++){
                vm.categoriesList.push(response.data.data[index]);
                vm.categories.push({text : response.data.data[index]["name"], value : response.data.data[index]["id"]});
            }
          }
        })
        .catch(function (error) {
            vm.$toast.error("getting data error ").goAway(2000);
            console.log(error);
        });
      },
      onReset(event) {
        event.preventDefault();
        // Reset our form values
        const product = { ... this.product}; //clone object product
        this.product.en_name = '';
        this.product.kh_name = '';
        this.product.category = null;
        this.product.description = '';
        this.product.brand = null;
        this.product.image = null;
        this.product.sale_price= 0;
        this.product.code= null;
        const data = {
          showModal :false,
          data:product
        };
        this.$emit('input', data);//send data back to parent component

      },
      onFileChange($event) {
        this.uploadFile = $event.target.files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
          document.getElementById("output").setAttribute("style","background-image: url(" + e.target.result + ')');
        };
        reader.readAsDataURL($event.target.files[0]);
      },
      handleSubmit(bvModalEvent){
        bvModalEvent.preventDefault();
        this.onSubmit();
      },
      async onSubmit(event) {
        let vm = this;
        let brands= [];
        let formData = new FormData();

        if(vm.product.brand && vm.product.brand.length > 0){
          for(let index=0; index < vm.product.brand.length; index++){
            brands.push(vm.product.brand[index]["value"]);
          }
        }
        formData.append("en_name", vm.product.en_name);
        formData.append("kh_name", vm.product.kh_name);
        formData.append("category_id", vm.product.category);
        formData.append("description", vm.product.description);
        formData.append("image", vm.uploadFile);
        formData.append("sale_price", '0');
        if(vm.product.code){
          formData.append("code", vm.product.code);
        }
        formData.append("brands" , JSON.stringify(brands));

        if(vm.product.hasOwnProperty("id") && vm.product.id){
          formData.append("_method", "PUT");
          vm.$toast.info("Data starting submit").goAway(1500);
          let sale_price = 0, warehouseId = null;
          const responseUpdateProduct = await vm.$axios.post('/api/product-price/update', { "warehouse": vm.product.warehouse, "product_id": vm.product.id, "sale_price": vm.product.sale_price});
          if (responseUpdateProduct && responseUpdateProduct.hasOwnProperty("data") && responseUpdateProduct.data.hasOwnProperty("data")) {
            sale_price = parseFloat(responseUpdateProduct["data"]["data"]["sale_price"]);
            warehouseId = responseUpdateProduct["data"]["data"]["warehouse_id"];
          }
          await vm.$axios.post('/api/product/' + vm.product.id, formData)
            .then(function (response) {
              if(response){
                vm.$toast.success("Submit data successfully").goAway(2000);
               if(response.hasOwnProperty("data") && response.data){
                 let Brands = vm.cloneObject(response.data["Brands"]);
                 let itemProduct = vm.cloneObject(response.data.product);

                 itemProduct["sale_price"] = sale_price;
                 itemProduct["warehouse_id"] = warehouseId;

                 let brandList = [], brandItemNameList = [];
                 if (brands && brands.length > 0) {
                   for (let i = 0; i < brands.length; i++) {
                     let brandItem = vm.brandList.find(b => b.id === brands[i]);
                     brandList.push(brandItem);
                     brandItemNameList.push(brandItem["name"]);
                   }
                 }
                 itemProduct["brands"] = brandList;
                 itemProduct["brand"] = brandItemNameList.join(", ");

                 let categoriesItem = vm.categoriesList.find(cat => cat.id === parseInt(response.data.product["category_id"]));
                 if(categoriesItem){
                   itemProduct["category_name"] = categoriesItem["name"];
                 }

                 vm.$emit("checkingProductAdd", {itemProduct: vm.cloneObject(itemProduct), brands: Brands, sale_price: sale_price});
               }
                vm.hideModal();
                //vm.product = {en_name: '', kh_name: '', category: null, brand: null, description: '', image: null, sale_price: 0, code: null};
              }
            })
            .catch(function (error) {
              console.log(error);
              vm.$toast.error("Submit data getting error").goAway(3000);
            });
        }
        else {
          vm.$toast.info("Data starting submit").goAway(1500);
          const responseProduct = await vm.$axios.post('/api/product', formData);
          if(responseProduct){
            vm.$toast.success("Submit data successfully").goAway(2000);
            if(responseProduct.hasOwnProperty("data")){
              let brandList = responseProduct.data.hasOwnProperty("Brands") ? responseProduct.data.Brands : [];
              let itemProduct = vm.cloneObject(responseProduct.data.product);

              if(responseProduct.data.hasOwnProperty("Brands")){
                let brandList = vm.cloneObject(responseProduct.data.Brands);
                if(brandList.length > 0){
                  let responseBrandName = [];
                  let responseBrand = [];
                  for(let k=0; k < brands.length; k++){
                    let itemResponseBrand = vm.cloneObject(vm.selectedBrandList(brands[k]));
                    let itemData = {"name": itemResponseBrand["name"], "id": itemResponseBrand["value"]};
                    responseBrandName.push(itemResponseBrand["name"]);
                    responseBrand.push(itemData);
                  }
                  itemProduct["brands"] = vm.cloneObject(responseBrand);
                  itemProduct["brand"] = responseBrandName.join(", ");
                }
              }

              if(responseProduct.data.product.hasOwnProperty("category_id")){
                let categoriesItem = vm.categoriesList.find(cat => cat.id === parseInt(responseProduct.data.product["category_id"]));
                if(categoriesItem){
                  itemProduct["category_name"] = categoriesItem["name"];
                }
              }

              if(!itemProduct.hasOwnProperty("name")){
                itemProduct['name'] = itemProduct["en_name"] + " (" + itemProduct["kh_name"] + ")";
              }
              itemProduct['loyalty'] = "N/A";
              let sale_price = 0, warehouseId = null;
              const responseUpdateProduct = await vm.$axios.post('/api/product-price/update', { "warehouse": vm.product.warehouse, "product_id": itemProduct.id, "sale_price": vm.product.sale_price});
              if (responseUpdateProduct && responseUpdateProduct.hasOwnProperty("data") && responseUpdateProduct.data.hasOwnProperty("data")) {
                sale_price = parseFloat(responseUpdateProduct["data"]["data"]["sale_price"]);
                warehouseId = responseUpdateProduct["data"]["data"]["warehouse_id"];
                let warehouseItem = vm.warehouseList.find(w => w.id === responseUpdateProduct["data"]["data"]["warehouse_id"]);
                itemProduct["warehouse"] = (warehouseItem["name"] + " (" + warehouseItem["address"] + ")");

                itemProduct["warehouse_id"] = warehouseId;
                itemProduct["sale_price"] = sale_price;
              }

              vm.$emit("checkingProductAdd", {itemProduct: itemProduct, brands: brandList});
              vm.hideModal();
            }
          }
          else {
            vm.$toast.error("Submit data getting error").goAway(3000);
          }
        }
      },
      selectedBrandList(item){
        let itemData;
        if(this.brands && this.brands.length > 0){
          for (let index=0; this.brands.length; index++){
            if(this.brands[index] && this.brands[index]["value"] && item === this.brands[index]["value"]){
              itemData = this.brands[index];
              break;
            }
          }
        }
        return itemData;
      },
      hideModal() {
        this.$refs['product-form-modal'].hide();
        this.product = {};
      },
      viewDetail($data){
        console.log($data);
        console.log("data",$data);
      },
      generateImageUrlDisplay(img){
        if (typeof window !== "undefined") {
          if((img !== "no image" && img !== "no image created")){
            return (window.location.protocol + "//" + window.location.hostname + ":8000/" + "storage/img/" + img) ;
          }
        }
      },
      filterCategoriesData(category_id){
        if(this.categories.length > 0){
          for (let k=0; k < this.categories.length; k++){
            if(category_id === this.categories[k]["id"]){
              return this.categories[k]["name"];
            }
          }
        }
      },
      selectionChange($obj){
        this.$forceUpdate();
      },
      removeElement($obj){
        this.$forceUpdate();
      },
      cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
      },
    },
  }
</script>

<style>
  .full-content .multiselect{
    height: 40px;
  }
  .content-file-upload{
    display: inline-block;
    position: relative;
    overflow: hidden;
    float: right;
    width: 90px;
    height: 90px;
    margin: 0;
    padding: 0;
  }
  .content-file-upload:hover{
    cursor: pointer;
  }
  .content-file-upload .img{
    width: 90px;
    height: 90px;
    background-repeat: round;
  }
  .content-file-upload .input-file{
    display: inline-block;
    position: absolute;
    cursor: pointer;
    height: 100%;
    width: 100%;
    opacity: 0;
    bottom: 0;
    right: 0;
  }
</style>
