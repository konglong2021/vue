<template>
  <b-container fluid class="bv-example-row main-page-content">
    <b-row>
      <div class="inventory-dashboard-content main-page-content">
        <div class="control-panel">
          <div class="panel-top">
            <div class="content-panel-left">
              <h3 class="head-title">Users Overview</h3>
            </div>
            <div class="content-panel-right">
              <b-container class="col-6 mx-auto menu-wrapper">
                <b-row>
                  <b-col>
                    <div class="input-group input-group-sm search-content">
                      <span class="input-group-addon button-search-box"><i class="fa fa-search"></i></span>
                      <input class="form-control input-search-box" type="search" placeholder="Search..."/>
                    </div>
                  </b-col>
                  <div class="btn-wrapper" v-can="'user_create'">
                    <b-button href="#"  title="Add new Category" size="sm" variant="primary"
                              @click="showModal()">
                      New User
                      <i class="fa fa-plus" aria-hidden="true"></i>
                    </b-button>
                  </div>
                </b-row>
              </b-container>
            </div>
            <div class="panel-bottom"></div>
          </div>
        </div>
        <div class="content-product content-user">
          <div class="content-loading" v-if="isLoading">
            <div class="spinner-grow text-muted"></div>
          </div>
          <div v-if="items && items.length > 0 && !isLoading">
            <b-table
              :items="items"
              :fields="fields"
              stacked="md"
              show-empty
              small>
              <template #cell(actions)="row">
                <b-button v-can="'user_access'" size="sm" variant="primary" title="View User Detail"  @click="viewDetailUser(row.item, row.index, $event.target)" class="mr-1">
                  <i class="fa fa-eye"></i>
                </b-button>
                <b-button v-can="'user_edit'" size="sm" title="Edit user" variant="success" @click="editUser(row.item, row.index, $event.target)">
                  <i class="fa fa-edit"></i>
                </b-button>
              </template>
              <!-- check this url : https://bootstrap-vue.org/docs/components/table#tables -->
            </b-table>
          </div>
        </div>
        <div></div>
      </div>
      <b-modal id="modal-create-user" ref="create-user-form-modal" size="lg"
               @hidden="onReset" cancel-title="Cancel" no-close-on-backdrop
               @ok="onSubmitEditUserData" ok-title="Save" title="New User"
               :hide-footer="user.isView"
      >
        <b-form enctype="multipart/form-data">
          <div class="full-content">
            <div class="content-file-upload">
              <b-form-file id="file" name="file" class="input-file" v-on:change="onFileChange" plain></b-form-file>
              <div id="profile-image" v-if="uploadFile" class="img"></div>
              <div v-if="!uploadFile && user && (!user.image || user.image === 'no image')" class="img" :style="{ backgroundImage: `url('images/image.png')` }"></div>
              <div v-if="!uploadFile && user && (user.image || user.image !== 'no image')" class="img" :style="{ backgroundImage: `url('${generateImageUrlDisplay(user.image)}')` }"></div>
            </div>
          </div>
          <div class="full-content">
            <b-row class="my-1">
              <div class="label-content-user"><label :for="'input-first-name'" class="label-input">{{$t('label_firstname')}}</label></div>
              <b-col sm="4"><b-form-input :id="'input-first-name'" type="text" v-model="user.firstname" class="input-content" v-inputTextSentenceCase></b-form-input></b-col>
              <div class="label-content-user"><label :for="'input-last-name'" class="label-input">{{$t('label_lastname')}}</label></div>
              <b-col sm="4"><b-form-input :id="'input-last-name'" type="text" v-model="user.lastname" class="input-content" v-inputTextUppercase></b-form-input></b-col>
            </b-row>
            <b-row class="my-1">
              <div class="label-content-user"><label :for="'input-occupation'" class="label-input">មុខងារ</label></div>
              <b-col sm="4"><b-form-input :id="'input-occupation'" type="text" v-model="user.occupation" class="input-content" v-inputTextSentenceCase></b-form-input></b-col>
              <div class="label-content-user"><label :for="'input-phone'" class="label-input">លេខទូរស័ព្ទ</label></div>
              <b-col sm="4"><b-form-input :id="'input-phone'" type="tel" v-model="user.phone" class="input-content" v-numericOnly></b-form-input></b-col>
            </b-row>
            <b-row class="my-1">
              <b-col sm="2"><label :for="'input-gender'" class="label-input">ភេទ</label></b-col>
              <b-col sm="8">
                <b-form-group>
                  <b-form-radio v-model="user.gender" name="gender-radios" value="M" class="display-inline-block">ប្រុស</b-form-radio>
                  <b-form-radio v-model="user.gender" name="gender-radios" value="F" class="display-inline-block">ស្រី</b-form-radio>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row class="my-1">
              <div class="label-content-user"><label :for="'input-user-name'" class="label-input">User Name</label></div>
              <b-col sm="4"><b-form-input :id="'input-user-name'" type="text" v-model="user.username" class="input-content"></b-form-input></b-col>
              <div class="label-content-user"><label :for="'input-user'" class="label-input">Email</label></div>
              <b-col sm="4"><b-form-input :id="'input-user'" class="form-control input-content" type="email" v-model="user.email"></b-form-input></b-col>
            </b-row>
            <b-row class="my-1">
              <div class="label-content-user"><label :for="'input-password'" class="label-input">Password</label></div>
              <b-col sm="4"><b-form-input :id="'input-password'" class="input-content" type="password" v-model="user.password"></b-form-input></b-col>
              <div class="label-content-user"><label :for="'input-birthdate'" class="label-input">Date of birth</label></div>
              <b-col sm="4"><b-form-input :id="'input-birthdate'" class="input-content" type="date" v-model="user.birthdate"></b-form-input></b-col>
            </b-row>
            <b-row class="my-1">
              <div class="label-content-user"><label class="label-input">ជ្រើសរើសឃ្លាំងគោល</label></div>
              <b-col sm="4"><b-form-select class="input-content font-size-15" v-model="user.warehouse_id" :options="warehouses"></b-form-select></b-col>
            </b-row>
            <b-row>
              <b-col sm="2"><label :for="'input-role'" class="label-input">Roles</label></b-col>
              <b-col sm="10">
                <multiselect
                  class="input-content"
                 v-model="user.role"
                 :options="roles" track-by="name" label="name"
                 :multiple="true" :show-labels="false"
                 aria-placeholder="Select User roles"
                 @select="selectionChange"
                 @remove="removeElement"></multiselect>
              </b-col>
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
    layout:'userui',
    data(){
      return {
        items:[],
        fields: [
           { key: 'name', label: 'Name' },
           { key: 'username', label: 'Username' },
           {key:'state',label:'Status'} ,
           {key:'last_login',label:'Last Login'},
           {key:'roles',label:'Roles'},
           { key: 'actions', label: 'Actions' },
        ],
        user:{isView: false}, //new item for user
        roles: [],
        isLoading: false,
        uploadFile: null,
        file: null,
        errors: [],
        warehouses: [],
    }
    },
    methods:{
      async getAllWarehouse(){
        let vm = this;
        vm.warehouses = [];

        await vm.$axios.get('/api/warehouse').then(function (response) {
          if(response && response.hasOwnProperty("data")){
            if(response.data.data){
              let data = response.data.data;
              for(let index=0; index < data.length; index++){
                vm.warehouses.push({text: (data[index]["name"] + " " + data[index]["address"]), value: data[index]["id"]});
              }
            }
          }
        }).catch(function (error) {
          console.log(error);
          vm.$toast.error("Getting data error").goAway(3000);
        });
      },
      async getAllRoles(){
        let self = this;
        self.roles = [];
        await self.$axios.get('/api/role').then(function (response) {
          if (response && response.hasOwnProperty("data")) {
            if(response.data.length > 0){
              for (let index=0; index < response.data.length; index++){
                self.roles.push({name: response.data[index]["title"], value: response.data[index]["id"]});
              }
            }
          }
        }).catch(function (error) {
          console.log(error);
          self.$toast.error("Submit data getting error").goAway(3000);
        });
      },
      async getUsers(){
        let self = this;
        self.items = [];
        self.isLoading = true;

        await self.$axios.get('/api/user').then(function (response) {
          self.isLoading = false;
          if (response && response.hasOwnProperty("data")) {
            let data = response.data;
            for (let index=0; index < data.length; index++){
              let item = {}, roleText = [];
              item["username"] = data[index]["email"];
              item["name"] = data[index]["name"];
              item["state"] = "Active";
              item["last_login"] = "";
              item["id"] = data[index]["id"];

              if (data[index].hasOwnProperty("roles") && data[index]["roles"]["length"] > 0) {
                item["rolesList"] = data[index]["roles"];
                data[index].roles.forEach((valueRole, indexRole ) => {
                  roleText.push(valueRole["title"]);
                });
                item["roles"] = roleText.join(", ");
              }
              item["role"] = self.cloneObject(data[index]["roles"]);
              if(data[index].hasOwnProperty("profile") && data[index]["profile"]){
                item["firstname"] = data[index]["profile"]["firstname"];
                item["lastname"] = data[index]["profile"]["lastname"];
                item["occupation"] = data[index]["profile"]["occupation"];
                item["phone"] = data[index]["profile"]["phone"];
                item["email"] = data[index]["profile"]["email"];
                item["address"] = data[index]["profile"]["address"];
                item["birthdate"] = data[index]["profile"]["birthdate"];
                item["profile_id"] = data[index]["profile"]["id"];
                item["gender"] = data[index]["profile"]["gender"];
              }
              self.items.push(item);
            }
          }
        }).catch(function (error) {
          console.log(error);
          self.$toast.error("Submit data getting error").goAway(3000);
        });
      },
      async onSubmitEditUserData(){
        let formData = new FormData();
        let self = this, dataSubmit = {}, rolesId = [], dataSubmitProfile ={};
        let profileId = self.user.profile_id;
        /*dataSubmit["name"] = (self.user["firstname"] + " " + self.user["lastname"]);
        dataSubmit["password"] = self.user.password;
        dataSubmit["email"] = self.user["email"];
        dataSubmit["warehouse_id"] = self.user["warehouse_id"];

        self.user["role"].forEach((value, index ) => {
          rolesId.push(value["value"]);
        });
        dataSubmit["roles"] = rolesId;
        dataSubmit["firstname"] = self.user["firstname"];
        dataSubmit["lastname"] = self.user["lastname"];
        dataSubmit["gender"] =  self.user["gender"];
        dataSubmit["occupation"] = self.user["occupation"];
        dataSubmit["phone"] =  self.user["phone"];
        dataSubmit["birthdate"] =  self.user["birthdate"];
        dataSubmit["address"] =  self.user["address"];*/

        self.user["role"].forEach((value, index ) => {
          rolesId.push(value["value"]);
        });
        formData.append("roles", JSON.stringify(rolesId));
        formData.append("name", (self.user["firstname"] + " " + self.user["lastname"]));
        formData.append("password", self.user.password);
        formData.append("email", self.user["email"]);
        formData.append("warehouse_id", self.user["warehouse_id"])
        formData.append("firstname", self.user["firstname"]);
        formData.append("lastname", self.user["lastname"]);
        formData.append("gender", self.user["gender"]);
        formData.append("occupation", self.user["occupation"]);
        formData.append("phone", self.user["phone"]);
        formData.append("email", self.user["email"]);
        formData.append("birthdate", self.user["birthdate"]);
        formData.append("address", self.user["address"]);
        formData.append("image", self.uploadFile);

        self.$toast.info("submit data in progress").goAway(1000);
        if(self.user.hasOwnProperty("id") && self.user.id){
          formData.append("_method", "PUT");
          self.$axios.post('/api/user/' + self.user.id, formData)
            .then(function (response) {
              let dataReturn = response.data;
              self.items.forEach((value, index ) => {
                if(value.id === dataReturn.id){
                  value["username"] = dataReturn["email"];
                  value["name"] = dataReturn["name"];
                  value["state"] = "Active";
                  value["last_login"] = "";
                  value["email"] = dataReturn["email"];
                  value["id"] = dataReturn["id"];
                  if (dataReturn.hasOwnProperty("roles") && dataReturn["roles"]["length"] > 0) {
                    dataReturn.roles.forEach((valueRole, indexRole ) => {
                      value["role"] = valueRole["id"];
                      value["roles"] = valueRole["title"];
                    });
                  }
                }
              });
            }).catch(function (error) {
              self.$toast.success("Data is getting error").goAway(2000);
              console.log(error);
            });
        }
        else {
          await self.$axios.post('/api/user', formData).then(function (response) {
            formData.append("user_id", response.data.user["id"]);
          }).catch(function (error) {
            console.log(error);
            self.$toast.error("Submit data getting error").goAway(3000);
          });
        }
      },
      async submitProfileData(dataSubmit, profile_id){
        let self = this;
        if(profile_id){
          self.$axios.put('/api/profile/' + profile_id, dataSubmit)
            .then(function (response) {
              console.log(response);
              self.user = {};
            })
            .catch(function (error) {
              self.$toast.success("Data is getting error").goAway(2000);
              console.log(error);
            });
        }
        else {
          await self.$axios.post('/api/profile', dataSubmit).then(function (response) {
            console.log(response);
            if(response){
              self.user = {};
            }
          }).catch(function (error) {
            console.log(error);
            self.$toast.error("Submit data getting error").goAway(3000);
          });
        }
      },
      showModal(){
        this.$nextTick(() => {
          this.$refs['create-user-form-modal'].show();
        });
      },
      selectionChange(){
        this.$forceUpdate();
      },
      removeElement(){
        this.$forceUpdate();
      },
      viewDetailUser(item, index, target){
        this.user = this.cloneObject(item);
        let roleList = [];
        if(item.hasOwnProperty("role")){
          for (let index=0; index < item["role"].length; index++){
            roleList.push({name: item["role"][index]["title"], value: item["role"][index]["id"]});
          }
          this.user["role"] = this.cloneObject(roleList);
        }
        this.user.isView = true;
        this.showModal();
      },
      editUser(item, index, target){
        let userObj = this.cloneObject(item);
        userObj.isView = false;
        userObj["id"] = item.id;
        userObj["username"] = item.username;
        userObj["email"] = item.email;
        let rolesList = [];
        for (let index=0; index < item["rolesList"].length; index++){
          rolesList.push({name: item["rolesList"][index]['title'], value: item["rolesList"][index]['id']});
        }
        userObj["role"] = this.cloneObject(rolesList);
        userObj["firstname"] = item["firstname"];
        userObj["lastname"] = item["lastname"];
        userObj["occupation"] = item["occupation"];
        userObj["phone"] = item["phone"];
        userObj["email"] = item["email"];
        userObj["address"] = item["address"];
        userObj["birthdate"] = item["birthdate"];
        userObj["profile_id"] = item["profile_id"];
        userObj["gender"] = item["gender"];
        this.user = this.cloneObject(userObj);
        this.showModal();
      },
      cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
      },
      onReset(event) {
        event.preventDefault();
        this.user = {};
      },
      onFileChange($event) {
        this.uploadFile = $event.target.files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
          document.getElementById("profile-image").setAttribute("style","background-image: url(" + e.target.result + ')');
        };
        reader.readAsDataURL($event.target.files[0]);
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
      this.getAllRoles();
      this.getUsers();
      this.getAllWarehouse();
    }
  }
</script>
