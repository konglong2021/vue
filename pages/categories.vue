<template>
  <b-container fluid class="bv-example-row main-page-content">
    <b-row>
      <div class="inventory-dashboard-content main-page-content">
          <div class="control-panel">
            <div class="panel-top">
              <div class="content-panel-left">
                <h3 class="head-title">{{ $t('content_title_categories') }}</h3>
              </div>
              <div class="content-panel-right">
                 <b-container class="col-6 mx-auto menu-wrapper">
                   <b-row>
                     <b-col>
                       <div class="input-group input-group-sm search-content">
                         <span class="input-group-addon button-search-box"><i class="fa fa-search"></i></span>
                         <input class="form-control input-search-box" type="search" placeholder="Search..." v-model="searchInput" @keyup.enter="searchCategories()" @change="handleClick"/>
                       </div>
                     </b-col>
                     <div class="btn-wrapper" v-can="'category_create'">
                       <b-button href="#"  title="Add new Category" size="sm" variant="primary" @click="showModal()">
                         {{ $t('label_add_new_category') }}
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
              <b-table class="content-table-scroll-category"
                       sticky-header="true"
                       :items="items"
                       :fields="fields"
                       :per-page="0"
                       :current-page="currentPage"
                       head-variant="light"
                >
                <template #cell(actions)="row">
                  <b-button v-can="'category_access'" size="sm" variant="primary" title="View Inventory History Detail"  @click="viewDetail(row.item, row.index, $event.target)" class="mr-1">
                    <i class="fa fa-eye"></i>
                  </b-button>
                  <b-button v-can="'category_edit'" size="sm" title="Adjust invetory stock" variant="success" @click="adjustCategory(row.item, row.index, $event.target)">
                    <i class="fa fa-edit"></i>
                  </b-button>
                </template>
                  <!-- check this url : https://bootstrap-vue.org/docs/components/table#tables -->
              </b-table>
            </div>
          </div>
      </div>
      <b-modal
        id="modal-create-category" ref="category-form-modal" size="lg"
        @hidden="onReset" :cancel-title="$t('label_cancel_button')"
        no-close-on-backdrop
        @ok="handleOnSubmit"
        :ok-only="isViewData"
        :ok-title="isViewData ? $t('label_close_button') : $t('label_save_button')"
        :title="isViewData ? $t('title_view_category') : (category && category.id) ? $t('title_edit_category') : $t('title_new_category')">
          <b-form enctype="multipart/form-data" @submit.stop.prevent="onSubmit">
            <div class="full-content">
            </div>
            <div class="full-content">
              <b-row class="my-1">
                <b-col sm="4"><label :for="'input-enname'" class="label-input">{{ $t('label_name_english') }}</label></b-col>
                <b-col sm="8"><b-form-input :id="'input-enname'" type="text" v-model="category.name" class="input-content" :disabled="isViewData"></b-form-input></b-col>
              </b-row>
              <b-row class="my-1">
                <b-col sm="4"><label :for="'input-khname'" class="label-input">{{ $t('label_name_khmer') }}</label></b-col>
                <b-col sm="8"><b-form-input :id="'input-khname'" type="text" v-model="category.kh_name" class="input-content" :disabled="isViewData"></b-form-input></b-col>
              </b-row>
              <b-row class="my-1">
                <b-col sm="4"><label :for="'input-category-brand'" class="label-input">{{ $t('title_brands') }}</label></b-col>
                <b-col sm="8">
                  <multiselect
                    class="input-category-brand"
                    v-model="category.brand" :options="brands"
                    track-by="name" label="name" :multiple="true"
                    :show-labels="false" aria-placeholder="Select brands"
                    @select="selectionChange"
                    @remove="removeElement"
                    :disabled="isViewData"
                  ></multiselect>
                </b-col>
              </b-row>
              <b-row class="my-1">
                <b-col sm="4"><label :for="'input-description'" class="label-input">{{ $t('label_description') }}</label></b-col>
                <b-col sm="8"><b-form-textarea :id="'input-description'" class="input-content" v-model="category.description" :disabled="isViewData"></b-form-textarea></b-col>
              </b-row>
            </div>
          </b-form>
        </b-modal>
    </b-row>
  </b-container>
</template>
<script>
  import {empty} from "../.nuxt/utils";
  export default {
    middleware: "local-auth",
    layout:'inventoryui',
    data(){
      return {
        categories:[],
        perPage: 8,
        currentPage: 1,
        items:[],
        fields: [
          { key: 'name', label: this.$t('label_name') },
          { key: 'parent', label: this.$t('label_parent') },
          { key: 'brand', label: this.$t('title_brand') },
          { key: 'total_product', label: this.$t('label_total_product') },
          { key: 'actions', label: this.$t('label_action_title') }
        ],
        category: {description: null,id: null, kh_name: null, name: null}, //new item for category
        brands: [],
        brandList: [],
        isLoading: false,
        categoryItemSelected: {},
        categoryView : {},
        totalRows: 0,
        searchInput: null,
        isViewData: false
      }
    },
    watch : {
      currentPage: {
        handler: function(value) {
          this.getCategories().catch(error => {
            console.error(error)
          });
        }
      }
    },
    methods:{
      async onGetBrand(){
        let self = this;
        await self.$axios.get('/api/brand')
          .then(function (response) {
            if(response.hasOwnProperty("data")){
              for(let index=0; index < response.data.brands.length; index++){
                self.brandList.push(response.data.brands[index]);
                self.brands.push({name : response.data.brands[index]["name"], value : response.data.brands[index]["id"]});
              }
            }
          }).catch(function (error) {
            self.$toast.error("getting data error ").goAway(2000);
            console.log(error);
          });
      },
      async getCategories(){
        let self = this;
        self.isLoading = true;
        self.items = [];

        await self.$axios.get('/api/category').then(function (response) {
          if(response.hasOwnProperty("data") && response.data && response.data.hasOwnProperty("data")){
            self.isLoading = false;
            let items = [];
            let responseData = self.cloneObject(response.data.data);
            for(let index=0; index < responseData.length; index++){
              let categoryItem = responseData[index];
              let brands = [];
              let item = {};

              if(categoryItem["brands"] && categoryItem["brands"].length > 0){
                for(let i =0; i < categoryItem["brands"].length; i++){
                  brands.push(categoryItem["brands"][i]["name"]);
                }
              }
              item["brands"] = self.cloneObject(categoryItem["brands"]);
              item['brand'] = brands.join(", ");

              item['id'] = categoryItem["id"];
              item['kh_name'] = categoryItem["kh_name"];
              item['name'] = categoryItem["name"];
              item['description'] = categoryItem["description"];
              item['parent'] = "--ROOT--";
              item['products_count'] = categoryItem["products_count"];
              items.push(item);
            }
            self.items = self.cloneObject(items);
          }
        }).catch(function (error) {
          self.$toast.error("getting data error ").goAway(2000);
          console.log(error);
        });
      },
      onReset(){},
      handleOnSubmit(bvModalEvent){
        if(!this.isViewData){
          bvModalEvent.preventDefault();
          this.onSubmit();
        }
      },
      async onSubmit(){
        let self = this;
        let dataSubmit = {};
        let brands = [];
        let formData = new FormData();
        if(self.category.brand && self.category.brand.length > 0){
          for(let index=0; index < self.category.brand.length; index++){
            brands.push(self.category.brand[index]["value"]);
          }
        }
        dataSubmit["name"] = self.category.name;
        dataSubmit["kh_name"] = self.category.kh_name;
        dataSubmit["brands"] = (brands);
        dataSubmit["description"] = self.category.description;

        if(self.category.hasOwnProperty("id") && self.category.id){
          formData.append("_method", "PUT");
          self.$toast.info("Data starting submit").goAway(1500);
          await self.$axios.put(('/api/category/' + self.category.id), dataSubmit)
            .then(function (response) {
              if(response){
                let brands = self.cloneObject(response.data.brands);
                let responseBrandName = [];
                let responseBrand = [];
                for(let i=0; i < brands.length; i++){
                  let itemBrand = self.brandList.find(b => b.id === brands[i]);
                  responseBrand.push(itemBrand);
                  responseBrandName.push(itemBrand["name"]);
                }
                for(let dataItem of self.items){
                  let itemFind = self.items.find(d => d.id === response.data.data.id);
                  if(itemFind){
                    itemFind["name"] = response.data.data["name"];
                    itemFind["kh_name"] = response.data.data["kh_name"];
                    itemFind["description"] = response.data.data["description"];
                    itemFind["brand"] = responseBrandName.join(", ");
                    itemFind['parent'] = "--ROOT--";
                    itemFind['products_count'] = response.data.data["products_count"];
                  }
                }
                self.$toast.success("Submit data successfully").goAway(2000);
                self.category = {};
                self.$nextTick(() => {
                  self.$refs['category-form-modal'].hide();
                });
              }
            })
            .catch(function (error) {
              console.log(error);
              self.$toast.error("Submit data getting error").goAway(3000);
            });
        }
        else{
          self.$toast.info("submit data in progress").goAway(1000);
          await self.$axios.post('/api/category', dataSubmit)
            .then(function (response) {
              if(response.data.hasOwnProperty("data")){
                let categoryItem = response.data.data;
                let brands = self.cloneObject(response.data.brands);
                let item = {};

                let responseBrandName = [];
                let responseBrand = [];
                for(let i=0; i < brands.length; i++){
                  let itemBrand = self.brandList.find(b => b.id === brands[i]);
                  responseBrand.push(itemBrand);
                  responseBrandName.push(itemBrand["name"]);
                }
                item["brands"] = self.cloneObject(responseBrand);
                item["brand"] = responseBrandName.join(", ");
                item['name'] = categoryItem["name"];
                item['kh_name'] = categoryItem["kh_name"];
                item['description'] = categoryItem["description"];
                item['parent'] = "--ROOT--";
                item['products_count'] = categoryItem["products_count"];
                self.items.unshift(item);
                self.$toast.success("submit data is successfully").goAway(1500);
                self.$nextTick(() => {
                  self.$refs['category-form-modal'].hide();
                });
              }
            })
            .catch(function (error) {
              self.$toast.success("submit data is getting error").goAway(2000);
              console.log(error);
            });
        }
      },
      updatedCategoryData(categoryList, categoryId, brands){
        for(let i=0; i < categoryList.length; i++){
          if(categoryList[i]["id"] === categoryId){
            let responseBrandName = [];
            let responseBrand = [];
            for(let i=0; i < brands.length; i++){
              let itemResponseBrand = this.cloneObject(this.selectedBrandList(brands[i]));
              let itemData = {"name": itemResponseBrand["name"], "id": itemResponseBrand["value"]};
              responseBrandName.push(itemResponseBrand["name"]);
            }
            categoryList[i]["brands"] = this.cloneObject(responseBrand);
            categoryList[i]["brand"] = responseBrandName.join(", ");
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
      showModal(){
        this.isViewData = false;
        this.$refs['category-form-modal'].show();
        this.category = {};
      },
      hideModal(){
        this.isViewData = false;
        this.category = {};
        this.$refs['category-form-modal'].hide();
      },
      viewDetail(item, index, target){
        this.isViewData = true;
        if(!empty(item)){
          this.category = this.cloneObject(item);
          let brandList = [];
          if(item.hasOwnProperty("brands")){
            for (let index=0; index < item["brands"].length; index++){
              brandList.push({name: item["brands"][index]['name'], value: item["brands"][index]['id']});
            }
            this.category["brand"] = this.cloneObject(brandList);
          }
        }
        this.$refs['category-form-modal'].show();
      },
      adjustCategory(item, index, target){
        this.isViewData = false;
        if(!empty(item)){
          this.category = this.cloneObject(item);
          let brandList = [];
          if(item.hasOwnProperty("brands")){
            for (let index=0; index < item["brands"].length; index++){
              brandList.push({name: item["brands"][index]['name'], value: item["brands"][index]['id']});
            }
            this.category["brand"] = this.cloneObject(brandList);
          }
        }
        this.$refs['category-form-modal'].show();
      },
      cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
      },
      selectionChange($obj){
        this.$forceUpdate();
      },
      removeElement($obj){
        this.$forceUpdate();
      },
      async searchCategories() {
        let self = this;
        self.isLoading = true;
        self.items = [];
        await this.$axios.post('/api/category/search', {search: this.searchInput}).then(function (response) {
          if(response.hasOwnProperty("data") && response.data && response.data.hasOwnProperty("data")){
            self.isLoading = false;
            let items = [];
            let responseData = self.cloneObject(response.data.data);
            for(let index=0; index < responseData.length; index++){
              let categoryItem = responseData[index];
              let brands = [];
              let item = {};

              if(categoryItem["brands"] && categoryItem["brands"].length > 0){
                for(let i =0; i < categoryItem["brands"].length; i++){
                  brands.push(categoryItem["brands"][i]["name"]);
                }
              }
              item["brands"] = self.cloneObject(categoryItem["brands"]);
              item['brand'] = brands.join(", ");

              item['id'] = categoryItem["id"];
              item['kh_name'] = categoryItem["kh_name"];
              item['name'] = categoryItem["name"];
              item['name'] = categoryItem["name"];
              item['parent'] = "--ROOT--";
              item['products_count'] = categoryItem["products_count"];
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
          this.onGetBrand();
        }
      },
    },
    mounted() {
      this.onGetBrand();
      this.getCategories();
    },
    computed:{
      rows() {
        return this.items.length
      }
    },
  }
</script>
<style scoped>
  .content-table-scroll-category {
    max-height: calc(100vh - 165px);
  }
</style>

