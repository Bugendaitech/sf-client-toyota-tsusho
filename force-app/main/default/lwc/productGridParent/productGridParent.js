import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';

import { MessageContext, publish } from 'lightning/messageService';
import msgService from '@salesforce/messageChannel/messageChannelForSlider__c';

import getPicklistValuesbyApex from '@salesforce/apex/StockProducts_Ctrl.getPicklistValues';
import getRelatedCategories    from '@salesforce/apex/StockProducts_Ctrl.getRelatedCategories';
import newGetProductsFromStock from '@salesforce/apex/StockProducts_Ctrl.newGetProductsFromStock';

export default class ProductGridParent extends NavigationMixin(LightningElement) {

    @wire(CurrentPageReference) pageRef;

    @track payload;

    @wire(MessageContext)
    messageContext

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


    connectedCallback(){

        console.log('this.pageRef.state '+JSON.stringify(this.pageRef.state));

        let obj  = JSON.parse(JSON.stringify(this.pageRef.state));

        if(JSON.stringify(obj)   === '{}'){

            console.log('is empty');
            this.fetchAllModels();

        }else{
            console.log('not empty '+obj.returnBy);

            let returnBy  = obj.returnBy; console.log('1');
            let returnUrl = obj.returnUrl; console.log('2');
            let returnKey = decodeURIComponent(obj.returnKey);

            console.log('returnKey '+returnKey);
            this.needToShowBreadcurmb = true;
            this.breadcurmbs  = JSON.parse(atob(returnUrl));

            this.payload = {globalSearchLayout : false};
            console.log('globalSearchLayout : '+JSON.stringify(this.payload));
            // if(result.status != 'warning'){

            publish(this.messageContext, msgService, this.payload);
            console.log('Message Published');

            if(returnBy == 'model'){
                console.log('inside for model');
                this.currentModel = returnKey;
                this.getRelatedFamilies(returnKey,'back');
            }else{
                console.log('inside for category');
                this.currentModel     = this.breadcurmbs[0].label;
                this.currentCategory  = returnKey;
                this.getRelatedProducts(returnKey,'back');
            }
        }

    }


    // @wire(getPicklistValuesbyApex, { objectName: 'Product2', fieldName: 'Model__c' })
    // wiredPicklistValuesForModel({ data, error }) {
    //     if (data) {
    //         //    console.log('Picklist Demo Options for Model__c Apex : ' + JSON.stringify(data));
    //            this.cmpTitle                = 'model';
    //            this.modelList               = data;
    //            this.itemList                = data;

    //            let childObj                 = {};
    //            childObj.title               = 'model';
    //            childObj.listItems           = data;
    //            childObj.showCount           = false;
    //            this.childData               = JSON.parse(JSON.stringify(childObj));
    //            this.isModelLoaded           = true;
    //            this.spinnerStatus           = true;
    //     } else if (error) {
    //         console.error('Picklist Error : ' + error);
    //         this._haveError    = true;
    //     }
    // }


    fetchAllModels(){
        getPicklistValuesbyApex({
            objectName : 'Product2',
            fieldName  : 'Model__c'
        })
        .then((data)=>{
            console.log('data '+JSON.stringify(data));

            if(data.length>0){
                this.cmpTitle                = 'model';
                this.modelList               = data;
                this.itemList                = data;

                let childObj                 = {};
                childObj.title               = 'model';
                childObj.listItems           = data;
                childObj.showCount           = false;
                this.childData               = JSON.parse(JSON.stringify(childObj));
            }else{
                this.notificationHandler('Error !','No Model found.','error');
            }


            this.isModelLoaded           = true;
            this.spinnerStatus           = true;
        })
        .catch((error)=>{
            console.error('Picklist Error : ' + error);
            this._haveError    = true;
        })
        .finally(()=>{
            console.log('fetchAllModels called');
        })
    }


    handleBack(event){
        console.log('inside back');
        event.preventDefault();

        let item   = event.target.dataset.item;
        let type   = event.target.dataset.type;
        let breadItems = JSON.parse(JSON.stringify(this.breadcurmbs));
        console.log('e '+item);
        console.log('e '+type);

        // this.spinnerStatus           = false;
        // this.isModelLoaded           = false;
        let pageName = 'Shop';
        let pageType = 'comm__namedPage';
        let curObj   = {};

        if(type == 'home'){
            console.log('inside home');
            this.handleGoBack({},pageName,pageType);

        }else if(type == 'model'){
            // this.isProductLoaded  = false;
            // this.productList      = [];
            // this.currentModel     = item;
            console.log('bef '+JSON.stringify(breadItems));
            breadItems = this.setBreadCrumbForBack(item,breadItems);
            console.log('aft '+JSON.stringify(breadItems));
            curObj.returnUrl         = btoa(JSON.stringify(breadItems));
            curObj.returnBy          = 'model';
            curObj.returnKey         = item;
            this.handleGoBack(curObj,pageName,pageType);


        }else if(type == 'category'){
            // this.isProductLoaded  = false;
            // this.productList      = [];
            // this.currentCategory  = item;
            console.log('bef '+JSON.stringify(breadItems));
            breadItems = this.setBreadCrumbForBack(item,breadItems);
            console.log('aft '+JSON.stringify(breadItems));
            curObj.returnUrl         = btoa(JSON.stringify(breadItems));
            curObj.returnKey         = item;
            curObj.returnBy          = 'category';
            this.handleGoBack(curObj,pageName,pageType);


        }else if(type == 'self'){
            this.fetchProductDetails(this.recId);
        }
    }

    handleGoBack(obj,pageName,pageType){

        let objVal   = JSON.stringify(obj);
        console.log('called '+objVal);
        let loadBy      = obj?.returnBy;
        let returnUrl   = obj?.returnUrl;
        console.log('called '+loadBy);
        console.log('called '+returnUrl);


        if(objVal === '{}'){
            console.log('inside blank');
            this[NavigationMixin.Navigate]({
                type: pageType,
                attributes: {
                    pageName: pageName,
                }
            });

        }else{
            console.log('inside not blank');

            this[NavigationMixin.Navigate]({
                type: pageType,
                attributes: {
                    pageName: pageName,
                },
                state: obj
            });
        }
    }


    setBreadCrumbForBack(val,breadItems){

        const objIdToFind            = val;
        const indexOfObj             = breadItems.findIndex(p => p.label === objIdToFind);


        // if (indexOfObj == -1) {            // As find return object else undefined
        //     let breadCurmbObj        =  {
        //         label    : val,
        //         name     : val,
        //         type     : type,
        //         isActive : true
        //     };

        //     this.breadcurmbs.forEach(obj => {
        //         obj.isActive = false;
        //       });
        //     this.breadcurmbs.push(breadCurmbObj);

        // }else
        if(indexOfObj != -1){
            // console.log('in index '+index);
            breadItems.splice(indexOfObj+1);
            breadItems[indexOfObj].isActive = true;
        }


        // console.log('array '+objIdToFind);
        // console.log('this.breadcurmbs '+JSON.stringify(breadItems));

        //this.breadcurmbs  = breadItems;
        return breadItems;

    }

    oldHandleBack(event){
        console.log('inside back');
        event.preventDefault();

        let item   = event.target.dataset.item;
        let type   = event.target.dataset.type;

        console.log('e '+item);
        console.log('e '+type);

        this.spinnerStatus           = false;
        this.isModelLoaded           = false;

        if(type == 'home'){
            // console.log('inside for home');
            // console.log('inside for home '+JSON.stringify(this.modelList));
            this.needToShowBreadcurmb    = false;
            this.breadcurmbs             = [];
            this.isProductLoaded         = false;
            this.productList             = [];
            this.fetchAllModels();

        }else if(type == 'model'){
            this.isProductLoaded  = false;
            this.productList      = [];
            this.currentModel     = item;
            this.getRelatedFamilies(item,'back');

        }else if(type == 'category'){
            this.isProductLoaded  = false;
            this.productList      = [];
            this.currentCategory  = item;
            this.getRelatedProducts(item,'back');
        }
        // this.notificationHandler('Warning !', 'In Progress.', 'warning');
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

            this.isProductLoaded  = false;
            this.productList      = [];
            this.currentModel     = onKey;
            this.getRelatedFamilies(onKey,'next');

        }else if(onItem == 'category'){

            this.currentCategory  = onKey;
            this.getRelatedProducts(onKey,'next');

        }
    }


    getRelatedFamilies(keyVal,toward){
        this.isModelLoaded   = false;
        getRelatedCategories({
            keyValue     : this.currentModel
        })
        .then((response)=>{
            console.log('res '+response);
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


                this.setBreadCrumb(keyVal,toward,'model');

            }else{


                this.spinnerStatus           = true;
                let childObj                 = {};
                childObj.title               = 'model';
                childObj.listItems           = this.modelList;
                childObj.showCount           = false;

                this.childData               = JSON.parse(JSON.stringify(childObj));
                this.isModelLoaded           = true;

                this.notificationHandler(res?.label,res?.msg,res?.status);
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
    setBreadCrumb(val,toward,type){

        this.needToShowBreadcurmb    = true;

        const objIdToFind            = val;
        const indexOfObj             = this.breadcurmbs.findIndex(p => p.label === objIdToFind);


        if (indexOfObj == -1 && toward == 'next') {            // As find return object else undefined
            let breadCurmbObj        =  {
                label    : val,
                name     : val,
                type     : type,
                isActive : true
            };

            this.breadcurmbs.forEach(obj => {
                obj.isActive = false;
              });
            this.breadcurmbs.push(breadCurmbObj);

        }else if(indexOfObj != -1 && toward === 'back'){
            // console.log('in index '+index);
            this.breadcurmbs.splice(indexOfObj+1);
            this.breadcurmbs[indexOfObj].isActive = true;
        }


        console.log('array '+objIdToFind);
        console.log('this.breadcurmbs '+JSON.stringify(this.breadcurmbs));



    }


    getRelatedProducts(keyVal,toward){
        console.log('called getRelatedProducts '+keyVal);

        this.isModelLoaded        = false;

        newGetProductsFromStock({
            modalType     :  this.currentModel,
            familyType    :  this.currentCategory
        })
        .then((response)=>{

            let res        = JSON.parse(response);

            if(!res?.error){
                this.setBreadCrumb(keyVal,toward,'category');
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
                this.isProductLoaded         = false;
                this.spinnerStatus           = true;
                let childObj                 = {};
                childObj.title               = 'category';
                childObj.listItems           = this.categoryList;
                childObj.showCount           = true;

                this.childData               = JSON.parse(JSON.stringify(childObj));
                this.isModelLoaded           = true;

                this.notificationHandler(res?.label,res?.msg,res?.status);
                this.needToShowFamily        = true;
                this.needToShowProducts      = false;
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