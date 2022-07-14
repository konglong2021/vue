<template>
  <b-container fluid class="bv-example-row main-page-content">
    <b-row>
      <div class="inventory-dashboard-content main-page-content">
        <div class="control-panel">
          <div class="panel-top">
            <div class="content-panel-left">
              <h3 class="head-title">Roles Overview</h3>
            </div>
            <div class="content-panel-right">
              <b-container class="col-6 mx-auto menu-wrapper">
                <b-row>
                  <b-col>
                    <div class="input-group input-group-sm search-content">
                      <span class="input-group-addon button-search-box"
                        ><i class="fa fa-search"></i
                      ></span>
                      <input
                        class="form-control input-search-box"
                        type="search"
                        placeholder="Search..."
                      />
                    </div>
                  </b-col>
                </b-row>
              </b-container>
            </div>
            <div class="panel-bottom"></div>
          </div>
        </div>
        <div class="content-product">
          <b-table
            :items="items"
            :fields="fields"
            stacked="md"
            show-empty
            small
          >
            <template #cell(actions)="row">
              <b-button size="sm" variant="primary" title="View data role of user" @click="viewDetail(row.item, row.index, $event.target)" class="mr-1">
                <i class="fa fa-eye"></i>
              </b-button>
              <b-button size="sm" title="Edit role of user" variant="success" @click="editRoleOfUser(row.item, row.index, $event.target)">
                <i class="fa fa-edit"></i>
              </b-button>
            </template>
            <!-- check this url : https://bootstrap-vue.org/docs/components/table#tables -->
          </b-table>
        </div>
        <b-modal
                id="modal-view-role" ref="view-role-form-modal" size="lg" no-close-on-backdrop
                title="ពិនិត្យទិន្នន័យ តួនាទីរបស់អ្នកប្រើប្រាស់" title-class="text-center mx-auto" hide-footer
        >
          <b-form enctype="multipart/form-data">
            <div class="full-content">
              <b-row class="my-1">
                <b-col sm="4"><label class="label-input">Name</label></b-col>
                <b-col sm="8">
                  <span>{{ roleView.name }}</span>
                  <!--<b-form-input type="text" v-model="roleView.name" class="input-content"></b-form-input>-->
                </b-col>
              </b-row>
              <b-row class="my-1">
                <b-col sm="4"><label class="label-input">Name(KH)</label></b-col>
                <b-col sm="8">
                  <span>{{ roleView.name }}</span>
                  <!--<b-form-input type="text" v-model="roleView.kh_name" class="input-content"></b-form-input>-->
                </b-col>
              </b-row>
            </div>
          </b-form>
        </b-modal>
        <b-modal
                id="modal-edit-role" ref="edit-role-form-modal" size="lg" no-close-on-backdrop
                @hidden="onReset" :cancel-title="$t('label_cancel_button')" no-close-on-backdrop
                @ok="handleOnSubmit" :ok-title="$t('label_save_button')"
                title="កែប្រែទិន្នន័យ តួនាទីរបស់អ្នកប្រើប្រាស់" title-class="text-center mx-auto" hide-footer
        >
          <b-form enctype="multipart/form-data">
            <div class="full-content">
              <b-row class="my-1">
                <b-col sm="4"><label class="label-input">Title Role</label></b-col>
                <b-col sm="8"><b-form-input type="text" v-model="roleView.title" class="input-content"></b-form-input></b-col>
              </b-row>
              <b-row class="my-1">
                <b-col sm="4"><label class="label-input">Permissions</label></b-col>
                <b-col sm="8">
                  <multiselect
                          class="input-category-brand"
                          v-model="roleView.permission" :options="permissions"
                          track-by="name" label="name" :multiple="true"
                          :show-labels="false" aria-placeholder="Select brands"
                          @select="selectionChange"
                          @remove="removeElement"
                  ></multiselect>
                </b-col>
              </b-row>

            </div>
          </b-form>
        </b-modal>
      </div>
    </b-row>
  </b-container>
</template>

<script>
    export default {
        middleware: "local-auth",
        layout: "userui",
        data() {
            return {
                items: [],
                fields: [
        { key: "title", label: "Title" },

        { key: "permission", label: "Permission" },
        { key: "actions", label: "Actions" }
      ],
                roleView: {},
                roleEdit: {},
                permissions: []
            };
        },
        methods: {
            cloneObject(obj) {
                return JSON.parse(JSON.stringify(obj));
            },
            async onGetDataPermissionList(){
                let self = this;
                await self.$axios.get('/api/permission').then(function (response) {
                    if(response.hasOwnProperty("data")){
                        for(let index=0; index < response.data.length; index++){
                            self.permissions.push({name : response.data[index]["title"], value : response.data[index]["id"]});
                        }
                    }
                }).catch(function (error) {
                    self.$toast.error("getting data error ").goAway(2000);
                    console.log(error);
                });
            },
            async onGetDataRoles(){
                let self = this;
                await self.$axios.get('/api/role')
                    .then(function (response) {
                        if(response.hasOwnProperty("data")){
                            for(let index=0; index < response.data.length; index++){
                                let roleItemResponse = response.data[index];
                                let itemRole = [];
                                let permissions = [];
                                if(roleItemResponse["permissions"] && roleItemResponse["permissions"].length > 0){
                                    for(let i =0; i < roleItemResponse["permissions"].length; i++){
                                        permissions.push(roleItemResponse["permissions"][i]["title"]);
                                    }
                                }
                                itemRole["permissions"] = self.cloneObject(roleItemResponse["permissions"]);
                                itemRole["permission"] = permissions.join(", ");
                                itemRole["title"] = response.data[index]["title"];
                                itemRole["id"] = response.data[index]["id"];
                                itemRole['permissionString'] = itemRole["permissions"].join(", ");
                                self.items.push(itemRole);
                            }
                        }
                    }).catch(function (error) {
                        self.$toast.error("getting data error ").goAway(2000);
                        console.log(error);
                    });
            },
            viewDetail(item, index, target) {
                this.roleView = item;
                this.$refs['view-role-form-modal'].show();
            },
            editRoleOfUser(item, index, target){
                this.roleEdit = this.cloneObject(item);
                this.roleEdit["id"] = item.hasOwnProperty("id") ? JSON.parse(item["id"]) : null;
                this.roleEdit["title"] = item.hasOwnProperty("title") ? JSON.parse(JSON.stringify(item["title"])) : null;
                let permissionList = [];
                if(item.hasOwnProperty("permissions")){
                    for (let index=0; index < item["permissions"].length; index++){
                        permissionList.push({name: item["permissions"][index]["title"], value: item["permissions"][index]["id"]});
                    }
                    this.roleEdit["permissions"] = this.cloneObject(permissionList);
                }
                console.log(this.roleEdit);
                this.$refs['edit-role-form-modal'].show();
            },
            selectionChange(){},
            removeElement(){},
            handleOnSubmit(bvModalEvent){
                bvModalEvent.preventDefault();
                this.onSubmit();
            },
            async onSubmit(){
                let self = this;
                let dataSubmit = {};
                let permissions = [];
                /*let formData = new FormData();
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
                                self.updatedCategoryData(self.items, response.data.data.id, brands);
                                self.$toast.success("Submit data successfully").goAway(2000);
                                self.category = {};
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
                                    let itemResponseBrand = self.cloneObject(self.selectedBrandList(brands[i]));
                                    responseBrandName.push(itemResponseBrand["name"]);
                                }
                                item["brands"] = self.cloneObject(responseBrand);
                                item["brand"] = responseBrandName.join(", ");
                                item['name'] = categoryItem["name"];
                                item['parent'] = "--ROOT--";
                                item['products_count'] = categoryItem["products_count"];
                                //self.items.push(item);
                                self.items.unshift(item);
                                self.$toast.success("submit data is successfully").goAway(1500);
                                self.hideModal();
                                self.category = {};
                            }
                        })
                        .catch(function (error) {
                            self.$toast.success("submit data is getting error").goAway(2000);
                            console.log(error);
                        });
                }*/
            },
            onReset(){}
        },
        mounted(){
            this.onGetDataPermissionList();
            this.onGetDataRoles();
        }
    };
</script>
