<template>
  <b-navbar toggleable="lg" class="inventory-bar">
    <div class="content-menu-icon">
      <ul class="list-menu">
        <li class="list-menu-item line-height">
          <a href="/"><span><i class="fa fa-th font-size-23"></i></span></a>
        </li>
      </ul>
    </div>
    <div class="content-menu-text">
      <ul class="list-menu-text">
        <li class="menu-text-item">
          <a href="/report-daily">
            <span><i class="fa fa-calendar-plus-o" aria-hidden="true"></i>  {{ $t('title_report_menu_daily') }}</span>
          </a>
        </li>
        <li class="menu-text-item" style="display: none">
          <a href="/report-monthly">
            <span> <i class="fa fa-calendar" aria-hidden="true"></i>  {{ $t('title_report_menu_monthly') }}</span>
          </a>
        </li>
        <li class="menu-text-item" style="display: none">
          <a href="/balance">
            <span> <i class="fa fa-money" aria-hidden="true"></i>  {{ $t('title_balance_balance') }}</span>
          </a>
        </li>
      </ul>
    </div>
    <div class="content-logout">
      <ul class="ul-style">
        <li class="li-style" style="overflow: hidden;">
          <a class="cursor-default no-cursor content-user-profile">
            <span class="content-user-img">
              <img :src="getUrlDisplayImgUser()" alt="" />
            </span>
            <span>{{ $store.$cookies.get('user').name }}</span>
          </a>
        </li>
        <li class="li-style" style="overflow: hidden;">
          <b-button class="button-no-background" @click="logOut()">
            <span> ចាកចេញ</span>
          </b-button>
        </li>
      </ul>
    </div>
  </b-navbar>
</template>
<script>
  export default {
    data(){
      return {
        isLoading: false
      }
    },
    methods: {
      async logOut(){
        let response = await this.$axios.post('/api/logout');
        if(response && response.data.hasOwnProperty("message") && (response.data.message.toLocaleLowerCase() === "logged out" || response.data.message.toLocaleLowerCase() === "logout")){
          await this.$router.push('/login');
        }
      },
      getUrlDisplayImgUser(){
        return this.$store.$cookies.get('user').image ? this.$store.$cookies.get('user').image : "images/no_icon.png";
      },
    },
    mounted() {
      let self = this;
      self.$nextTick(() => {
        self.$nuxt.$loading.start();
        setTimeout(() => self.$nuxt.$loading.finish(), 700)
      });
    },
  }
</script>
<style >
  .inventory-bar{
    background-color:#232d3b;
    padding-left: 10px;
    padding-right: 10px;
    display: inline-block;
    width: 100%;
  }

  .content-menu-icon{
    display: inline-block;
    float: left;
  }
  .content-menu-icon .list-menu{
    list-style: none;
    margin: 0;
  }
  .content-menu-icon .list-menu .list-menu-item {
    display: inline-block;
    position: relative;
    line-height: 55px;
    cursor: pointer;
    padding: 0 10px;
    height: 50px;
  }

  .content-menu-icon .list-menu .list-menu-item a {
    display: inline-block;
    position: relative;
    color: #ffffff;
  }
  .content-menu-icon .list-menu .list-menu-item a span{
    display: inline-block;
  }

  .content-menu-text{
    display: inline-block;
    float: left;
  }
  .content-menu-text .list-menu-text{
    list-style: none;
    color: #ffffff;
    margin: 0;
  }
  .content-menu-text .list-menu-text .menu-text-item {
    display: inline-block;
    line-height: 45px;
    cursor: pointer;
    padding: 0 15px;
    height: 50px;
  }
  .content-menu-text .list-menu-text .menu-text-item a {
    color: #FFFFFF !important;
  }
  .content-menu-text .list-menu-text .menu-text-item a:hover{
    text-decoration: none;

  }
  .font-size-23{
    font-size: 23px;
  }
</style>
