<template>
  <div class="main-screen" >
    <div>
      <div class="main-menu">
        <b-container class="col-8 mx-auto menu-wrapper">
          <b-row>
            <b-col>
              <b-button href="/users" class="color-white" variant="dark">
                <i class="fa fa-users fa-3x" > </i> <div>
                {{ $t('index_menu_user') }}
              </div>
              </b-button>
            </b-col>
            <b-col>
              <b-button href="/pos" variant="primary" >
                <i class="fa fa-desktop fa-3x" > </i>
                <div>
                  {{ $t('index_menu_pos') }}
                </div>
              </b-button>
            </b-col>
            <b-col>
              <b-button href="/inventory"  variant="success">
                <i class="fa fa-bar-chart fa-4x" > </i> <div>
                {{ $t('index_menu_inventory') }}
              </div>
              </b-button>
            </b-col>
            <b-col>
              <b-button href="/report-daily"  variant="warning">
                <i class="fa fa-area-chart fa-4x" > </i> <div>
                {{ $t('index_menu_report') }}
              </div>
              </b-button>
            </b-col>
          </b-row>
        </b-container>
      </div>
      <div style="text-align: center; font-size: 12px;">
        <div class="footer-rights">
          Copyright © 2022 Fireart Studio. All rights reserved.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DefaultWareHouse from "../components/DefaultWareHouse";
export default {
  components: {DefaultWareHouse},
  middleware: "local-auth",
  layout: "main",
  data(){
    return {
      loadingField: false,
      storeList : [],
    }
  },
  watch:{
    newSelectModal:{
      handler(val){
      },
      deep:true
    }
  },
  methods: {
    async getListStores(){
      let self = this;
      self.loadingField = true;
      await self.$axios.get('/api/warehouse').then(function (response) {
        self.loadingField = false;
        if(
          response && response.hasOwnProperty("data")
          && response.data
          && response.data.hasOwnProperty("data")
        ){
          self.storeList = response.data.data;
        }
      }).catch(function (error) {
        self.$toast.error("getting data error").goAway(2000);
      });
    },
    cloneObject(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
  },
  mounted() {
    let self = this;
  }
};
</script>

<style  scoped>
  .main-menu {
    padding-top :100px;
    height: calc(100vh - 20px);
  }
  .main-menu .btn {
    padding-top: 10px;
    min-width: 200px;
    min-height: 150px;
    margin:10px 2px;
  }
  .main-menu .btn i {
      margin-top: 5px;
  }
</style>
