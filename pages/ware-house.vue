<template>
  <b-container fluid class="bv-example-row main-page-content">
    <b-row>
      <div class="display-inline-block full-with">
        <div class="inventory-dashboard-content main-page-content">
          <div class="control-panel">
            <div class="panel-top">
              <div class="content-panel-left">
                <h3 class="head-title">WareHouse Overview</h3>
              </div>
              <div class="content-panel-right">
                <b-container class="col-6 mx-auto menu-wrapper">
                  <b-row>
                    <b-col>
<!--                      <div class="input-group input-group-sm search-content">-->
<!--                        <span class="input-group-addon button-search-box"><i class="fa fa-search"></i></span>-->
<!--                        <input class="form-control input-search-box" type="search" placeholder="Search..."/>-->
<!--                      </div>-->
                    </b-col>
                    <div class="btn-wrapper" v-can="'warehouse_create'">
                      <b-button href="#"  title="Add new WareHouse" size="sm" variant="primary"
                                @click="showModal()">
                        {{ $t('title_new_warehouse') }}
                        <i class="fa fa-plus" aria-hidden="true"></i>
                      </b-button>
                    </div>

                  </b-row>
                </b-container>
              </div>
              <div class="panel-bottom"></div>
            </div>
          </div>
          <div class="content-product">
            <div class="content-loading" v-if="loadingFields">
              <div class="spinner-grow text-muted"></div>
            </div>
            <div v-if="!loadingFields">
              <div v-if="items">
                <b-table
                  class="content-table-scroll-ware-house"
                  sticky-header="true"
                  :items="items"
                  :fields="fields"
                  head-variant="light">
                  <template #cell(actions)="row">
                    <b-button v-can="'warehouse_access'" size="sm" variant="primary" title="View Inventory History Detail"  @click="viewDetail(row.item, row.index, $event.target)" class="mr-1">
                      <i class="fa fa-eye"></i>
                    </b-button>
                    <b-button v-can="'warehouse_edit'" size="sm" title="Adjust invetory stock" variant="success" @click="editWareHouse(row.item, row.index, $event.target)">
                      <i class="fa fa-edit"></i>
                    </b-button>
                  </template>
                  <!-- check this url : https://bootstrap-vue.org/docs/components/table#tables -->
                </b-table>
              </div>
            </div>
          </div>
          <div>
          </div>
        </div>
        <b-modal
          id="modal-create-warehouse" ref="warehouse-form-modal" size="lg"
          @hidden="onResetWareHouse" :cancel-title="$t('label_cancel_button')" no-close-on-backdrop
          @ok="handleOnSubmitWareHouse" :ok-only="isViewData"
          :ok-title="isViewData ? $t('label_close_button') : $t('label_save_button')"
          :title="isViewData ? $t('title_view_warehouse') : (warehouse.id ? $t('title_edit_warehouse') : $t('title_new_warehouse'))"
        >
          <b-form enctype="multipart/form-data" @submit.stop.prevent="onSubmitWareHouse">
            <div class="full-content">
            </div>
            <div class="full-content">
              <b-row class="my-1">
                <b-col sm="4"><label :for="'input-name'" class="label-input">{{$t('label_name')}}</label></b-col>
                <b-col sm="8">
                  <b-form-input :id="'input-name'" type="text" v-model="warehouse.name" class="input-content" :disabled="isViewData"></b-form-input>
                </b-col>
              </b-row>
              <b-row class="my-1">
                <b-col sm="4"><label :for="'input-address'" class="label-input">{{$t('label_address')}}</label></b-col>
                <b-col sm="8">
                  <b-form-input :id="'input-address'" type="text" v-model="warehouse.address" class="input-content" :disabled="isViewData"></b-form-input>
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
    layout:'inventoryui',
    data(){
      return {
        items:[],
        fields: [
          { key: 'name', label: this.$t('label_name') },
          { key: 'address', label: this.$t('label_address') },
          { key: 'actions', label: this.$t('label_action_title') }
        ],
        warehouse: {},
        loadingFields: true,
        perPage: 8,
        currentPage: 1,
        totalRows: 0,
        dataView: {},
        isViewData: false,
      }
    },
    watch : {
      currentPage: {
        handler: function(value) {
          this.loadingFields = true;
          this.getListData().catch(error => {
            console.error(error)
          });
        }
      }
    },
    methods:{
      async getListData(){
        let vm = this;
        await this.$axios.get('/api/warehouse').then(function (response) {
          vm.loadingFields = false;
          if(response && response.data.hasOwnProperty("data")){
            if(response.data.data){
              vm.items = vm.cloneObject(response.data.data);
            }
          }
        }).catch(function (error) {
          console.log(error);
          vm.$toast.error("Getting data error").goAway(3000);
        });
      },
      showModal(){
        this.isViewData = false;
        this.$refs['warehouse-form-modal'].show();
      },
      onResetWareHouse(){

      },
      handleOnSubmitWareHouse(bvModalEvent){
        if(!this.isViewData) {
          bvModalEvent.preventDefault();
          this.onSubmitWareHouse();
        }
      },
      async onSubmitWareHouse(){
        let vm = this;
        if(!vm.warehouse.hasOwnProperty("id")){
          vm.$toast.info("Data starting submit").goAway(1500);
          await vm.$axios.post('/api/warehouse/', vm.warehouse).then(function (response) {
            vm.$toast.success("Submit data successfully").goAway(2000);
            vm.loadingFields = false;
            if(response && response.data.hasOwnProperty("warehouse")){
              if(response.data.warehouse){
                vm.items.unshift(response.data.warehouse);
              }
            }
            vm.$nextTick(() => {
              vm.isViewData = false;
              vm.$refs['warehouse-form-modal'].hide();
            });
          }).catch(function (error) {
            console.log(error);
            vm.$toast.error("Getting data error").goAway(3000);
          });
        }
        else {
          vm.$toast.info("Data starting submit").goAway(1500);
          await vm.$axios.put('/api/warehouse/' + vm.warehouse.id, vm.warehouse).then(function (response) {
            vm.$toast.success("Submit data successfully").goAway(2000);
            vm.loadingFields = false;
            if(response && response.data.hasOwnProperty("warehouse")){
              if(response.data.warehouse){
                for(let i=0; i < vm.items.length; i++){
                  if(vm.items[i]["id"] === response.data.warehouse.id){
                    vm.items[i] = response.data.warehouse;
                  }
                }
              }
            }
            vm.$nextTick(() => {
              vm.isViewData = false;
              vm.$refs['warehouse-form-modal'].hide();
            });
          }).catch(function (error) {
            console.log(error);
            vm.$toast.error("Getting data error").goAway(3000);
          });
        }
        vm.warehouse = {};
      },
      cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
      },
      viewDetail(item, index, target){
        this.isViewData = true;
        this.warehouse = item;
        this.$refs['warehouse-form-modal'].show();
      },
      editWareHouse(item, index, target){
        this.isViewData = false;
        this.warehouse = item;
        this.showModal();
      },
    },
    mounted() {
      this.loadingFields = true;
      this.getListData();
    }
  }
</script>
<style scoped>
  .content-table-scroll-ware-house{
    max-height: calc(100vh - 165px);
  }
</style>
