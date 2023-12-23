import { LightningElement,wire } from 'lwc';
import getProductsFromStock from '@salesforce/apex/StockProducts_Ctrl.getProductsFromStock';

import getPicklistValuesbyApex from '@salesforce/apex/StockProducts_Ctrl.getPicklistValues';

export default class ProductGridParent extends LightningElement {

    _haveError;
    _errorMsg;

    _buf_productList;
    _buf_totalProducts;
    productList;

    spinnerStatus    = false;
    isLoaded         = false;

    _needPagination  = false;
    _pageSizeOptions = [{ value: 25, label: 25},{ value: 50, label: 50},{ value: 75, label: 75},{ value: 100, label: 100}];
    _defaultPageSize = 25;
    _curPageNumber   = 1;
    _totalPages      = 1;
    _totalRecords    = 25;
    proFamiles       = [];


    connectedCallback(){
        console.log('called ProductGridParent');
    }

    @wire(getPicklistValuesbyApex, { objectName: 'Product2', fieldName: 'Family' })
    wiredPicklistValues({ data, error }) {
        if (data) {
            //console.log('Picklist Data Apex : ' + JSON.stringify(data));
            this.proFamiles = [];
            this.catList = [];
            this.proFamiles = data;
            this.catList = data.map(entry => entry.value);

            // data.values.forEach(ele =>{
            //                 console.log('yes '+ele.value);
            //                 this.catList = [...this.catList,ele.value];
            //             })

            //          this.proFamiles  = data.value;
        } else if (error) {
            console.error('Picklist Error : ' + error);
        }
    }

    _wiredMyData;
    @wire(getProductsFromStock)
    wireAccountData(wireResultMy) {

        const { data, error }   = wireResultMy;
        this._wiredMyData       = wireResultMy;

        // console.log('data from getProductsFromStock', data);

        if (data) {

            let res  = JSON.parse(data);

            if (!res.error) {

                this._buf_productList   = res.data;
                this._buf_totalProducts = res.totalProducts;
                this._haveError         = false;
                this.setProductForChild(this._buf_productList);
                this.isLoaded           = true;
                console.log('in data');

            } else {

                this._buf_productList   = [];
                this._buf_totalProducts = 0;
                this._haveError         = true;
                this._errorMsg          = res.msg;
                this.isLoaded           = true;
                console.log('in error');

            }
            this.spinnerStatus = true;
        } else if (error) {

            this.error          = error;
            this.spinnerStatus  = true;
        }

    }


    setProductForChild(productItems){
        this.productList  = [...productItems];
    }


    handleCategory(event){


        this.spinnerStatus = false;
        let title          = event.target.dataset.title;
        let ind            = this.catList.indexOf(title);

        this.records = [];

        this.refs.childCmp.cleanProductList([]);
        let listOfCategory  = this.template.querySelectorAll('.custom-badge');

        if(ind == -1){

            listOfCategory.forEach((ele, i, orgArray) =>{
                if(i==0){
                    orgArray[i].classList.add('custom-badge-active'); // = "utility:chevrondown";
                }else{
                    orgArray[i].classList.remove('custom-badge-active'); // = "utility:chevrondown";
                }
            })

            this.productList   = [...this._buf_productList];
            this.spinnerStatus = true;
        }else{
            listOfCategory.forEach((ele, i, orgArray) =>{
                // //console.log('ele '+ind);
                if(ind+1 == i){
                    orgArray[i].classList.add('custom-badge-active'); // = "utility:chevrondown";
                }else{
                    orgArray[i].classList.remove('custom-badge-active'); // = "utility:chevrondown";
                }

            })

            let filterData = [...this._buf_productList];

          //console.log('filterData '+JSON.stringify(filterData));

            let afterFilter = filterData.filter(function (el) {
                return el.Product2.Family == title;
            });


          //console.log('filterData '+JSON.stringify(afterFilter));
            this.productList = [...afterFilter];
            //this.refs.childCmp.cleanProductList(afterFilter);
            this.spinnerStatus = true;

            // console.log('_buf_productList '+JSON.stringify(this._buf_productList));
            // console.log('this.productList '+JSON.stringify(this.productList));
        }
    }


}