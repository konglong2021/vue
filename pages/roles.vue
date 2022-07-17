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
        <div class="content-product content-role">
          <div class="content-loading" v-if="isLoading">
            <div class="spinner-grow text-muted"></div>
          </div>
          <div v-if="items && items.length > 0 && !isLoading">
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
            </b-table>
          </div>
        </div>
        <b-modal
                id="modal-view-role" ref="view-role-form-modal" size="lg" no-close-on-backdrop
                title="ពិនិត្យទិន្នន័យ តួនាទីរបស់អ្នកប្រើប្រាស់" title-class="text-center mx-auto"
                ok-only ok-title="បិទ" footer-class="justify-content-center"
        >
          <b-form enctype="multipart/form-data">
            <div class="full-content">
              <b-row class="my-1">
                <b-col sm="4"><label class="label-input">Title Role</label></b-col>
                <b-col sm="8">
                  <span>{{ roleView.title }}</span>
                </b-col>
              </b-row>
              <b-row class="my-1">
                <b-col sm="4"><label class="label-input">Permission</label></b-col>
                <b-col sm="8">
                  <span>{{ roleView.permission }}</span>
                </b-col>
              </b-row>
            </div>
          </b-form>
        </b-modal>
        <b-modal
                id="modal-edit-role" ref="edit-role-form-modal" size="lg" no-close-on-backdrop
                @hidden="onReset" :cancel-title="$t('label_cancel_button')" no-close-on-backdrop
                @ok="handleOnSubmit" :ok-title="$t('label_save_button')"
                title="កែប្រែទិន្នន័យ តួនាទីរបស់អ្នកប្រើប្រាស់" title-class="text-center mx-auto"
        >
          <b-form enctype="multipart/form-data">
            <div class="full-content" style="min-height: 250px;">
              <b-row class="my-1">
                <b-col sm="4"><label class="label-input">Title Role</label></b-col>
                <b-col sm="8"><b-form-input type="text" v-model="roleEdit.title" class="input-content"></b-form-input></b-col>
              </b-row>
              <b-row class="my-1">
                <b-col sm="4"><label class="label-input">Permissions</label></b-col>
                <b-col sm="8">
                  <multiselect
                          class="input-content"
                          v-model="roleEdit.permission" :options="permissions"
                          track-by="name" label="name" :multiple="true"
                          :show-labels="false" aria-placeholder="Select Permission"
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
            isLoading: false,
            items: [],
            fields: [
              { key: "title", label: "Title" },
              { key: "permission", label: "Permission", },
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
                self.items = [];
                self.isLoading = true;
                await self.$axios.get('/api/role')
                    .then(function (response) {
                        self.isLoading = false;
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
                    this.roleEdit["permission"] = this.cloneObject(permissionList);
                }
                this.$refs['edit-role-form-modal'].show();
            },
            selectionChange($obj){
              this.$forceUpdate();
            },
            removeElement(){
              this.$forceUpdate();
            },
            handleOnSubmit(bvModalEvent){
                bvModalEvent.preventDefault();
                this.onSubmit();
            },
            async onSubmit(){
                let self = this;
                let dataSubmit = {};
                let permissions = [];
                let formData = new FormData();
                if(self.roleEdit.permission && self.roleEdit.permission.length > 0){
                    for(let index=0; index < self.roleEdit.permission.length; index++){
                      permissions.push(self.roleEdit.permission[index]["value"]);
                    }
                }
                dataSubmit["title"] = self.roleEdit.title;
                dataSubmit["permissions"] = (permissions);
                if(self.roleEdit.hasOwnProperty("id") && self.roleEdit.id){
                    formData.append("_method", "PUT");
                    self.$toast.info("Data starting submit").goAway(1500);
                    await self.$axios.put(('/api/role/' + self.roleEdit.id), dataSubmit)
                        .then(function (response) {
                            if(response && response.data){
                                self.onGetDataRoles();
                                // let roleItem = response.data.role;
                                // let permissions = self.cloneObject(response.data.permissions);
                                // let itemData = self.items.find(i=> i.id === roleItem.id);
                                // //self.items.unshift(itemData);
                                // for(let i=0; i< self.items.length; i++){
                                //     if(roleItem.id === self.items[i].id){
                                //         let responsePermissionsName = [];
                                //         let responsePermissions = [];
                                //         for(let i=0; i < permissions.length; i++){
                                //             let itemResponsePermission = self.cloneObject(self.selectedPermissionList(permissions[i]));
                                //             responsePermissionsName.push(itemResponsePermission["name"]);
                                //         }
                                //         self.items[i]["permission"] = responsePermissionsName.join(", ");
                                //         self.items[i]['title'] = roleItem["title"];
                                //     }
                                // }
                                self.$nextTick(() => {
                                    self.$refs['edit-role-form-modal'].hide();
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
                    await self.$axios.post('/api/role', dataSubmit)
                        .then(function (response) {
                            if(response.data.hasOwnProperty("data")){
                                let roleItem = response.data.role;
                                let permissions = self.cloneObject(response.data.permissions);
                                let itemData = {};

                                let responsePermissionsName = [];
                                let responsePermissions = [];
                                for(let i=0; i < permissions.length; i++){
                                    let itemResponseBrand = self.cloneObject(self.selectedPermissionList(permissions[i]));
                                    responsePermissionsName.push(itemResponseBrand["name"]);
                                }
                                //itemData["permissions"] = self.cloneObject(responseBrand);
                                itemData["permission"] = responsePermissionsName.join(", ");
                                itemData['title'] = roleItem["title"];
                                itemData['id'] = roleItem["id"];
                                self.items.unshift(itemData);
                                self.$nextTick(() => {
                                    self.$refs['edit-role-form-modal'].hide();
                                });
                                self.$toast.success("submit data is successfully").goAway(1500);
                            }
                        })
                        .catch(function (error) {
                            self.$toast.success("submit data is getting error").goAway(2000);
                            console.log(error);
                        });
                }
            },
            onReset(){},
            selectedPermissionList(item){
                let itemData;
                if(this.permissions && this.permissions.length > 0){
                    for (let index=0; this.permissions.length; index++){
                        if(this.permissions[index] && this.permissions[index]["value"] && item === this.permissions[index]["value"]){
                            itemData = this.permissions[index];
                            break;
                        }
                    }
                }
                return itemData;
            },
        },
        mounted(){
            this.onGetDataPermissionList();
            this.onGetDataRoles();
        }
    };
</script>
