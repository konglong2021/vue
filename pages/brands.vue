<template>
  <b-container fluid class="bv-example-row main-page-content">
    <b-row>
      <div class="inventory-dashboard-content main-page-content">
          <div class="control-panel">
            <div class="panel-top">
              <div class="content-panel-left">
                <h3 class="head-title">{{ $t('content_title_brands') }}</h3>
              </div>
              <div class="content-panel-right">
                <b-container class="col-6 mx-auto menu-wrapper">
                  <b-row>
                    <b-col>
                      <div class="input-group input-group-sm search-content">
                        <span class="input-group-addon button-search-box"><i class="fa fa-search"></i></span>
                        <input class="form-control input-search-box" type="search" placeholder="Search..." v-model="searchInput" @keyup.enter="searchBrand()" @change="handleClick"/>
                      </div>
                    </b-col>
                    <div class="btn-wrapper" v-can="'brand_create'">
                      <b-button href="#"  title="Add new Category" size="sm" variant="primary"
                                @click="showModal()">
                        {{ $t('label_add_brand') }}
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
            <div class="content-loading" v-if="isLoading">
              <div class="spinner-grow text-muted"></div>
            </div>
            <div v-if="items && items.length > 0 && !isLoading">
              <b-table class="content-table-body"
                       sticky-header="true"
                       :items="items"
                       :fields="fields"
                       head-variant="light"
              >
                <template #cell(actions)="row">
                  <b-button v-can="'brand_access'" size="sm" variant="primary" title="View data brand detail"  @click="viewDetail(row.item, row.index, $event.target)" class="mr-1">
                    <i class="fa fa-eye"></i>
                  </b-button>
                  <b-button v-can="'brand_edit'" size="sm" title="Adjust invetory Brand" variant="success" @click="editBrand(row.item, row.index, $event.target)">
                    <i class="fa fa-edit"></i>
                  </b-button>
                </template>
              </b-table>
            </div>
          </div>
      </div>
      <b-modal
        id="modal-create-brand" ref="brand-form-modal" size="lg"
        @hidden="onReset" :cancel-title="$t('label_cancel_button')"
        @ok="handleOnSubmit"
        :ok-only="isViewData"
        :ok-title="isViewData ? $t('label_close_button') : $t('label_save_button')"
        :title="isViewData ? $t('title_view_brand') : ((brand && brand.id) ? $t('title_edit_brand') : $t('title_new_brand'))" no-close-on-backdrop
      >
        <b-form enctype="multipart/form-data" @submit.stop.prevent="onSubmit">
          <div class="full-content">
          </div>
          <div class="full-content">
            <b-row class="my-1">
              <b-col sm="4"><label :for="'input-enname'" class="label-input">{{ $t('label_name_english') }}</label></b-col>
              <b-col sm="8"><b-form-input :id="'input-enname'" type="text" v-model="brand.en_name" class="input-content" :disabled="isViewData"></b-form-input></b-col>
            </b-row>
            <b-row class="my-1" >
              <b-col sm="4"><label :for="'input-category'" class="label-input">{{ $t('title_category') }}</label></b-col>
              <b-col sm="8">
                <multiselect class="input-content"
                             v-model="brand.category"
                             :options="categories" track-by="name" label="name"
                             :multiple="true" :show-labels="false" aria-placeholder="Select categories"
                             @select="selectionChange"
                             :disabled="isViewData"
                             @remove="removeElement"></multiselect>
              </b-col>
            </b-row>

            <b-row class="my-1">
              <b-col sm="4"><label :for="'input-description'" class="label-input">{{ $t('label_description') }}</label></b-col>
              <b-col sm="8"><b-form-textarea :id="'input-description'" class="input-content" v-model="brand.description" :disabled="isViewData"></b-form-textarea></b-col>
            </b-row>
          </div>
        </b-form>
      </b-modal>
    </b-row>
  </b-container>
</template>
<script>
  export default {
    middleware: "local-auth",
    layout:'inventoryui',
    data(){
      return {
        categories: [],
        perPage: 8,
        currentPage: 1,
        items: [],
        fields: [
          { key: 'name', label: this.$t('label_name') },
          { key: 'parent', label: this.$t('label_parent') },
          { key: 'total_product', label: this.$t('label_total_product') },
          { key: 'categories', label: this.$t('title_categories') },
          { key: 'actions', label: this.$t('title_action') }
        ],
        brand: {},
        isLoading: false,
        totalRows: 0,
        searchInput: null,
        isViewData : false,
      }
    },
    watch : {
      currentPage: {
        handler: function(value) {
          this.getBrands().catch(error => {
            console.error(error)
          });
        }
      }
    },
    mounted() {
      this.getCategories();
      this.getBrands();
    },
    methods:{
      async getCategories(){
        const response = await this.$axios.get('/api/category');
        if(response.data.hasOwnProperty("data")){
          for(let index=0; index < response.data.data.length; index++){
            this.categories.push({name : response.data.data[index]["name"], value : response.data.data[index]["id"]});
          }
        }
      },
      async getBrands(){
        let self = this;
        self.isLoading = true;
        await self.$axios.get('/api/brand').then(function (response) {
        if(response.data.hasOwnProperty("brands")){
          self.isLoading = false;
          let items = [];
          for(let index=0; index < response.data.brands.length; index++){
            let brandItem = response.data.brands[index];
            let categories = [];
            let item = {};
            item['categoryList'] = self.cloneObject(brandItem["categories"]);
            if(brandItem["categories"] && brandItem["categories"].length > 0){
              for(let i =0; i < brandItem["categories"].length; i++){
                categories.push(brandItem["categories"][i]["name"]);
              }
            }
            item['id'] = brandItem["id"];
            item['name'] = brandItem["name"] + (brandItem["kh_name"] ? "(" + brandItem["kh_name"] + ")": "");
            item['kh_name'] = brandItem["kh_name"];
            item['en_name'] = brandItem["name"];
            item['categories'] = categories.join(", ");
            item['parent'] = "--ROOT--";
            item['total_product'] = brandItem["products_count"];
            items.push(item);
          }
          self.items = self.cloneObject(items);
        }
        })
          .catch(function (error) {
            console.log(error);
            self.$toast.error("Submit data getting error").goAway(3000);
          });
      },
      onReset(){},
      handleOnSubmit(bvModalEvent){
        if(!this.isViewData){
          bvModalEvent.preventDefault();
          this.onSubmit();
        }
      },
      onSubmit(){
        let dataSubmit = {};
        let categories = [];
        if(this.brand.category.length > 0){
          for(let i =0; i < this.brand.category.length; i++){
            categories.push(this.brand.category[i]["value"]);
          }
        }
        dataSubmit["kh_name"] = this.brand.kh_name;
        dataSubmit["name"] = this.brand.en_name;
        dataSubmit["categories"] = categories;
        dataSubmit["description"] = this.brand.description;

        let self = this;
        self.$toast.info("submit data in progress").goAway(1000);
        if(self.brand.hasOwnProperty("id")){
          self.$axios.put('/api/brand/' + self.brand.id, dataSubmit)
            .then(function (response) {
              if(response.hasOwnProperty("data")){
                let brand = response.data.brand;
                let categoriesId = (response.data.categories);
                let brandCategories = [];
                let newCategory = [];
                let newCategoryList = [];

                for(let k=0; k< categoriesId.length; k++){
                  for (let i=0; i < self.categories.length; i++){
                    if(categoriesId[k] === self.categories[i]["value"]){
                      brandCategories.push(self.categories[i]["name"]);
                      newCategory.push({name : self.categories[i]["name"], value : self.categories[i]["value"]});
                      newCategoryList.push({name : self.categories[i]["name"], id : self.categories[i]["value"]});
                      break;
                    }
                  }
                }
                for(let index=0; index < self.items.length; index++){
                  if(self.items[index]["id"] === brand.id){
                    self.items[index]["category"] = self.cloneObject(newCategory);
                    self.items[index]['categoryList'] = self.cloneObject(newCategoryList);
                    self.items[index]['id'] = brand["id"];
                    self.items[index]['name'] = brand["name"] + (brand["kh_name"] ? "(" + brand["kh_name"] + ")": "");
                    self.items[index]['kh_name'] = brand["kh_name"];
                    self.items[index]['en_name'] = brand["name"];
                    self.items[index]['categories'] = brandCategories.join(", ");
                    self.items[index]['parent'] = "--ROOT--";
                    self.items[index]['total_product'] = brand["products_count"];
                  }
                }
                self.$toasted.success("Data successfully Updated..!").goAway(1500);
                self.hideBrandModal();
                self.brand = {};
              }
            })
            .catch(function (error) {
              self.$toast.success("Data is getting error").goAway(2000);
              console.log(error);
            });
        }
        else {
          self.$axios.post('/api/brand', dataSubmit)
            .then(function (response) {
              if(response.data.hasOwnProperty("brand")){
                self.items.unshift(response.data.brand);
                self.$toasted.success("Data successfully added..!").goAway(1500);
                self.hideBrandModal();
              }
            })
            .catch(function (error) {
              self.$toast.success("Data is getting error").goAway(2000);
              console.log(error);
            });
        }
      },
      showModal(){
        this.isViewData = false;
        this.$refs['brand-form-modal'].show();
      },
      hideBrandModal(){
        this.isViewData = false;
        this.$refs['brand-form-modal'].hide();
      },
      viewDetail(item, index, target){
        this.isViewData = true;
        this.brand = this.cloneObject(item);
        if(item.hasOwnProperty("categoryList")){
          let categoryList = [];
          for (let index=0; index < item["categoryList"].length; index++){
            categoryList.push({name: item["categoryList"][index]['name'], value: item["categoryList"][index]['id']});
          }
          this.brand["category"] = this.cloneObject(categoryList);
        }
        this.$refs['brand-form-modal'].show();
      },
      editBrand(item, index, target){
        this.isViewData = false;
        this.brand = item;
        if(item.hasOwnProperty("categoryList")){
          let categoryList = [];
          for (let index=0; index < item["categoryList"].length; index++){
            categoryList.push({name: item["categoryList"][index]['name'], value: item["categoryList"][index]['id']});
          }
          this.brand["category"] = this.cloneObject(categoryList);
        }
        this.$refs['brand-form-modal'].show();
        //this.showModal();
      },
      async searchBrand() {
        let self = this;
        self.isLoading = true;
        self.items = [];
        await this.$axios.post('/api/brand/search', {search: this.searchInput}).then(function (response) {
        if (response) {
          self.isLoading = false;
          let items = [];
          for(let index=0; index < response.data.brands.length; index++){
            let brandItem = response.data.brands[index];
            let categories = [];
            let item = {};
            item['categoryList'] = self.cloneObject(brandItem["categories"]);
            if(brandItem["categories"] && brandItem["categories"].length > 0){
              for(let i =0; i < brandItem["categories"].length; i++){
                categories.push(brandItem["categories"][i]["name"]);
              }
            }
            item['id'] = brandItem["id"];
            item['name'] = brandItem["name"] + (brandItem["kh_name"] ? "(" + brandItem["kh_name"] + ")": "");
            item['kh_name'] = brandItem["kh_name"];
            item['en_name'] = brandItem["name"];
            item['categories'] = categories.join(", ");
            item['parent'] = "--ROOT--";
            item['total_product'] = brandItem["products_count"];
            items.push(item);
          }
          self.items = self.cloneObject(items);
        }
        }).catch(function (error) {
          console.log(error);
          self.$toast.error("Submit data getting error").goAway(3000);
        });
      },
      handleClick(e) {
        if (e.target.value === '' || e.target.value === null || e.target.value === undefined) {
          this.searchInput = null;
          this.getBrands();
        }
      },
      cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
      },
      selectionChange($obj){
        this.$forceUpdate();
      },
      removeElement($obj){
        this.$forceUpdate();
      }
    },
    computed:{},
  }
</script>

<style scoped>
  .content-table-body{
    max-height: calc(100vh - 165px);
  }
</style>
