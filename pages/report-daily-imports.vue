<template>
    <b-container>
        <b-row>
            <div class="inventory-dashboard-content main-page-content">
                <div class="control-panel">
                    <div class="panel-top">
                        <div class="content-panel-left">
                            <h3 class="head-title">របាយការ ការនាំចូល</h3>
                        </div>
                        <div class="content-panel-right">
                            <b-container class="col-12 mx-auto menu-wrapper">
                                <b-row>
                                    <div>
                                        ចាប់ពីថ្ងៃ
                                    </div>
                                    <b-col>
                                        <b-form-datepicker id="datepicker-from-date" formatted="yyyy-MM-dd"
                                            v-model="fromDate"
                                            :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                                            locale="en"></b-form-datepicker>
                                    </b-col>
                                    <div>
                                        ដល់ថ្ងៃ
                                    </div>
                                    <b-col>
                                        <b-form-datepicker id="datepicker-to-date" v-model="toDate"
                                            :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                                            locale="en"></b-form-datepicker>
                                    </b-col>
                                    <div class="btn-wrapper">
                                        <b-button href="#" @click="selectDate()" title="បញ្ចូល" size="sm"
                                            variant="primary">
                                            បង្ហាញ
                                            <i class="fa fa-search" aria-hidden="true"></i>
                                        </b-button>
                                         <b-button href="#" @click="getPurchases('excel')" title="Excel" size="sm"
                                            variant="primary">
                                            ជា Excel
                                            <i class="fa fa-file-excel-o" aria-hidden="true"></i>
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
                    <div v-if="!isLoading">
                        <div class="overflow-auto">
                            <div class="report-head">
                                <b-row>
                                    <b-col>
                                    <p class="rp-total">  ចំនួន ប្រតិបត្តការ ៖​  {{ $util.formatInt(pTotalTran)}} </p>
                                    </b-col>
                                    <b-col>
                                        <p class="rp-total">
                                        សរុប ការនាំចូល ($) ៖{{ $util.format(pTotalMoney)}}
                                        </p>
                                    </b-col>
                                </b-row>
                            </div>
                            <table class="table b-table table-sm">
                                <thead>
                                    <tr>
                                        <th>លេខវិក័យបត្រ័</th>
                                        <th>Reference</th>
                                        <th>ថ្ងៃខែប្រតិបត្តិការ </th>
                                        <th>អ្នកផ្គត់ផ្គង់</th>
                                        <th>សរុប ($)</th>
                                        <th> ពន្ធ (%)</th>
                                        <th>សរុបរួម ($)</th>
                                        <th>បញ្ចូលដោយ</th>
                                        <th>ឃ្លាំង</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, index) in items" :key="item.id">
                                        <td>{{item.invoice}}</td>
                                        <td> {{item.ref}} </td>
                                        <td> {{formatDateDisplay(item.created_at)}}</td>
                                        <td> {{item.supplier}}</td>
                                        <td> {{item.subtotal}}</td>
                                        <td> {{item.vat}}</td>
                                        <td> {{item.grandtotal}}</td>
                                        <td> {{item.user_name}}</td>
                                        <td> {{item.warehouse_name}}</td>


                                    </tr>
                                    </tbody>
                            </table>
                            <div class="table-footer">
                                <b-row>
                                    <b-col cols="2">
                                        <p><b-form-select v-model="pPerPage" :options="perPageList"></b-form-select>  </p>
                                    </b-col>
                                        <b-col cols="2">
                                            <p>
                                            ក្នុងមួយទំព័រ  |
                                            </p>
                                        </b-col>
                                        <b-col cols="1">
                                            <p>
                                                 ទំព័រទី: {{ currentPage }}
                                            </p>
                                        </b-col>
                                        <b-col>
                                            <b-pagination @change="onPageChanged" v-model="currentPage" :total-rows="rows"
                                                :per-page="perPage" aria-controls="my-table"></b-pagination>
                                        </b-col>
                                </b-row>
                            </div>
                            <div>




                            </div>

                        </div>
                    </div>
                    <div></div>
                </div>
            </div>
        </b-row>
    </b-container>
</template>
<script>

import moment from "moment";

export default {
    middleware: "local-auth",
    layout: 'report',
    data() {
        return {
            fromDate: '',
            toDate: '',
            perPage: 10,
            pPerPage :10,
            pCurrentPage:1,
            pTotalTran : 0,
            pTotalMoney: 0,
            perPageList :[
                10,
                20,
                50,
                100,
                500,
                1000
            ],
            "currentPage": 1,
            fields: [
                    { key: 'invoice_id', label: 'លេខវិក័យបត្រ័' },
                    { key: 'created_at', label: 'ថ្ងៃខែបញ្ចូល' },
                    {key:'grandtotal',label:'សរុប'} ,
                    {key:'vat',label:'ពន្ធ'}
                    ],
            items: [
            ],
            rows: 0
        };
    },
    mounted() {
        console.log( this.$util.format(200.0001) );
        const today = new Date();
        const day   = 1;
        const month = today.getMonth();
        const year = today.getFullYear();
        this.toDate = this.$moment(new Date()).format("YYYY-MM-DD");
        console.log( year, month, day);
        this.fromDate = this.$moment({year: year, month: month, day: day}).format( "YYYY-MM-DD");
        console.log( this.fromDate);
        this.isLoading = false;
        this.getPurchases();


    },
    watch:{
        pPerPage(newValue,oldValue) {
            console.log( 'updated per page', newValue);
            this.currentPage = 1;
            this.pCurrentPage = 1;
            this.perPage = newValue;
            this.getPurchases();

        }
    },
    methods: {
        async selectDate() {
            await this.getPurchases();
        },
        isLoading() {
            return true;
        },
        paginate(page_size, page_number) {
            this.pPerPage = page_size;
            this.pCurrentPage = page_number;
           this.getPurchases();
        },
        onPageChanged(page) {
            this.paginate(this.perPage, page);
        },
        async exportExcel() {},
        async getPurchases(type){
            if( !type || type === undefined) {
                type = 'data';
            }
            const self = this;
            const resp = await self.$axios.get('/api/report-purchase',{
                params: {
                    from_date: this.fromDate,
                    to_date: this.toDate,
                    current_page: this.pCurrentPage,
                    per_page: this.pPerPage,
                    type: type
                }
            }).then(function (response) {
                    if( response.status === 200) {
                        let data = response.data;
                        if( data.success){
                            if( type === 'excel') {
                                debugger;
                                var url = data.data;
                                window.open( url,'_newtab');
                                return;
                            }
                            self.items = data.data.purchase;
                            self.rows = data.data.total;
                            self.pTotalMoney = data.data.summary.total;
                            self.pTotalTran = self.rows;

                        }
                        else {
                            self.$toast.error( data.message ).goAway(3000);
                        }
                    }
                    else {
                        console.log( response );
                        self.$toast.error("Error getting data" ).goAway(3000);
                    }


            }).catch(function (error) {
                console.log( error);
            });
            return null;


        },
        formatDateDisplay(date){
          return moment(date, "YYYY-MM-DD").format("DD/MM/YYYY").toString();
        }
    }
}</script>
