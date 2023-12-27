import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getPicklistValuesbyApex from '@salesforce/apex/StockProducts_Ctrl.getPicklistValues';
import getRelatedCategories    from '@salesforce/apex/StockProducts_Ctrl.getRelatedCategories';
import newGetProductsFromStock from '@salesforce/apex/StockProducts_Ctrl.newGetProductsFromStock';

export default class DemoProductGridParent extends LightningElement {

    @track _haveError           = false;
    @track childData            = {};
    @track itemList             = [];
    @track modelList            = [];
    @track categoryList         = [];
    @track productList          = [];
    @track breadcurmbs          = [];
    @track pickedModal          = '';
    @track needToShowFamily     = false;
    @track needToShowProducts   = false;
    @track needToShowBreadcurmb = false;

    cmpTitle                    = 'Model';
    currentModel                = '';
    currentCategory             = '';

    _errorMsg;
    _buf_obj                    = {};
    _buf_productList;
    _buf_totalProducts;
    productList;

    spinnerStatus               = false;
    isLoaded                    = false;


    isModelLoaded               = false;
    isCategoryLoaded            = false;
    isProductLoaded             = false;



    _needPagination  = false;
    _pageSizeOptions = [{ value: 5, label: 5},{ value: 10, label: 10},{ value: 15, label: 15},{ value: 20, label: 20},{ value: 50, label: 50}];
    _defaultPageSize = 5;
    _curPageNumber   = 1;
    _totalPages      = 1;
    _totalRecords    = 0;
    @track arrayOfLastIndexs = [0];

    get disablePreviousButtons() {
        if(this._buf_productList.length == 0 || this._curPageNumber == 1)
            return true;
    }

    get disableNextButtons() {
        if(this._buf_productList.length == 0 || this._curPageNumber == this.totalPages)
            return true;
    }



    @wire(getPicklistValuesbyApex, { objectName: 'Product2', fieldName: 'Model__c' })
    wiredPicklistValuesForModel({ data, error }) {
        if (data) {
               console.log('Picklist Demo Options for Model__c Apex : ' + JSON.stringify(data));
               this.cmpTitle                = 'model';
               this.modelList               = data;
               this.itemList                = data;
               this.isModelLoaded           = true;

               let childObj                 = {};
               childObj.title               = 'model';
               childObj.listItems           = data;
               childObj.showCount           = false;
               this.childData               = JSON.parse(JSON.stringify(childObj));
               this.spinnerStatus           = true;
        } else if (error) {
            console.error('Picklist Error : ' + error);
            this._haveError    = true;
        }
    }


    handleBack(event){
        let e   = event.target.dataset.item;

        console.log('e '+e);
        this.notificationHandler('Warning !', 'In Progress.', 'warning');
        // let breadCurmbObj  =  {
        //     label: folderName,
        //     name: folderName,
        //     id: childFolderId,
        //     isActive : true,
        //   };
    }

    handleCustomClick(e){

        this.spinnerStatus           = false;
        let details                  = e?.detail;
        let onItem                   = details?.item;
        let onKey                    = details?.key;


        if(onItem == 'model'){
            this.currentModel     = onKey;
            this.getRelatedFamilies(onKey);

        }else if(onItem == 'category'){

            this.currentCategory  = onKey;
            this.getRelatedProducts(onKey);

        }
    }


    getRelatedFamilies(keyVal){
        this.isModelLoaded   = false;
        getRelatedCategories({
            keyValue     : keyVal
        })
        .then((response)=>{

            let res = JSON.parse(response);
            if(res?.status == 'success'){

                this.categoryList            = res?.data;

                let childObj                 = {};
                childObj.title               = 'category';
                childObj.listItems           = res?.data;
                childObj.showCount           = true;

                this.childData               = JSON.parse(JSON.stringify(childObj));
                this.isModelLoaded           = true;
                this.spinnerStatus           = true;


                this.setBreadCrumb(keyVal);


            }else{
                this.needToShowFamily     = false;
                this.needToShowProducts   = false;
            }
        })
        .catch((err)=>{
            console.log('JSON err '+JSON.stringify(err));
            this.needToShowFamily        = false;
            this.spinnerStatus           = true;
        })
        .finally(()=>{
            console.log('finally ');
        })
    }




    // update existing


    setBreadCrumb(val){
        this.needToShowBreadcurmb    = true;
        let breadCurmbObj            =  {
                                            label    : val,
                                            name     : val,
                                            isActive : true
                                        };

        let exists                   = this.breadcurmbs.includes(breadCurmbObj);

        if(!exists){
             this.breadcurmbs.forEach(obj => {
                obj.isActive = false;
              });
            this.breadcurmbs.push(breadCurmbObj);
        }

    }




    getRelatedProducts(keyVal){
        console.log('called getRelatedProducts '+keyVal);

        this.isModelLoaded        = false;

        newGetProductsFromStock({
            modalType     :  this.currentModel,
            familyType    :  this.currentCategory
        })
        .then((response)=>{

            let res        = JSON.parse(response);



            if(!res?.error){
                this.setBreadCrumb(keyVal);
                this._buf_obj             = res;
                this._buf_productList     = res?.data;
                this.totalRecords         = res?.totalProducts;

                if(res?.totalProducts > this._defaultPageSize){         // if product count is more then set pagination
                    this.totalPages           = Math.ceil(res.totalProducts / Number(this._defaultPageSize)) > 0 ? Math.ceil(res.totalProducts / Number(this._defaultPageSize)) : 1;
                    this._needPagination      = true; //
                    this.handlePagination();
                }else{
                    this.productList          = JSON.parse(JSON.stringify(res?.data));
                    this.isProductLoaded      = true;
                    this.spinnerStatus        = true;
                }

            }else{
                this.isProductLoaded      = false;
            }
        })
        .catch((err)=>{
            console.log('JSON err '+JSON.stringify(err));
            this.needToShowProducts   = false;
            this.spinnerStatus        = true;
        })
        .finally(()=>{
            console.log('finally ');
        })
    }


    handleRecordSizeChange(event) {
        // this.actionInProgress = true;
        this.spinnerStatus              = false;
        this._defaultPageSize           = parseInt(event.detail.value);
        // this.bottomRecordId             = null;
        this._curPageNumber             = 1;

        // this.totalPages              = Math.ceil(obj.totalProducts / Number(this._defaultPageSize)) > 0 ? Math.ceil(obj.totalProducts / Number(this._defaultPageSize)) : 1;
        this.totalPages                 = Math.ceil(this.totalRecords / Number(this._defaultPageSize)) > 0 ? Math.ceil(this.totalRecords / Number(this._defaultPageSize)) : 1;
        // this.fromMethod       = 'wire';
        this.handlePagination();
    }


    handleNavigation(event){
        let buttonName = event.target.label;
        // this.needCall  = true;
        if(buttonName == 'First') {
            this._curPageNumber   = 1;
            this.actionType   = 'ASC';
        } else if(buttonName == 'Next') {
            this._curPageNumber   = this._curPageNumber >= this.totalPages ? this.totalPages : this._curPageNumber + 1;
            this.actionType   = 'ASC';
        } else if(buttonName == 'Previous') {

            this._curPageNumber   = this._curPageNumber > 1 ? this._curPageNumber - 1 : 1;
            let retIndex          = this._curPageNumber;
            if(retIndex==1){
                this.arrayOfLastIndexs = [0];
                this.bottomRecordId    = null;
            }else{
                this.bottomRecordId = this.arrayOfLastIndexs[retIndex];
               // console.log(this.arrayOfLastIndexs[retIndex]+' index');
            }
            this.actionType   = 'DESC';


        } else if(buttonName == 'Last') {
           // console.log('Inside');
            this._curPageNumber   = this.totalPages;
            this.topRecordId = null;
            this.actionType   = 'DESC';
           // console.log('Inside');
            this._curPageNumber   = this.totalPages;
           // console.log('Inside 1 '+this.totalRecords+' & ');
            let lastIndex     = Math.ceil(parseInt(this.totalRecords) - parseInt(this._defaultPageSize));
           // console.log('Inside 2 '+lastIndex);
            if(lastIndex>this._defaultPageSize){
                let lastDigit = lastIndex.sub
            }
        }
       // console.log('done');
        this.handlePagination();
    }


    handlePagination(){

        let allProList              = JSON.parse(JSON.stringify(this._buf_productList));
        let fromIndex               = ((this._curPageNumber*this._defaultPageSize)-this._defaultPageSize);
        let toIndex                 = ((this._curPageNumber*this._defaultPageSize));
        console.log('from '+fromIndex+' & toIndex '+toIndex);
        let newArrayOfData          = allProList.slice(fromIndex,toIndex);
        this.productList            = [...newArrayOfData];
        this.isProductLoaded        = true;
        this.spinnerStatus          = true;


    }


        // ===================== toast notification handler ===============================
	notificationHandler(titleText, msgText, variantType) {
        const toastEvent = new ShowToastEvent({
          title: titleText,
          message: msgText,
          variant: variantType,
        });
        dispatchEvent(toastEvent);
        return;
    }

}