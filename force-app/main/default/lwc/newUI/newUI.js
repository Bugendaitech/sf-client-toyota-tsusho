import { LightningElement,track,wire } from 'lwc';

import getPicklistValuesbyApex from '@salesforce/apex/StockProducts_Ctrl.getPicklistValues';
import getRelatedCategories from '@salesforce/apex/StockProducts_Ctrl.getRelatedCategories';
import newGetProductsFromStock from '@salesforce/apex/StockProducts_Ctrl.newGetProductsFromStock';


export default class NewUI extends LightningElement {


    @track _haveError           = false;

    @track modalList            = [];
    @track familyList           = [];
    @track productList          = [];
    @track pickedModal          = '';
    @track needToShowFamily     = false;
    @track needToShowProducts   = false;


    @wire(getPicklistValuesbyApex, { objectName: 'Product2', fieldName: 'Model__c' })
    wiredPicklistValuesForModel({ data, error }) {
        if (data) {
               console.log('Picklist Options for Model__c Apex : ' + JSON.stringify(data));
               this.modalList  = data;
        } else if (error) {
            console.error('Picklist Error : ' + error);
            this._haveError    = true;
        }
    }




    handleClick(e){
        e.stopPropagation();

        let type = e.target.dataset.item;
        let key  = e.target.dataset.key;
        console.log('type '+type+' key '+key);

        if(type == 'modal'){
            this.pickedModal  = key;
            this.needToShowFamily     = false;
            this.needToShowProducts   = false;
            this.getRelatedFamilies(key);
        }else if(type == 'family'){

            this.getRelatedProducts(key);
        }else if(type == 'product'){

            console.log('product');
        }


    }


    getRelatedFamilies(keyVal){
        console.log('called getRelatedFamilies '+keyVal);
        getRelatedCategories({
            keyValue     : keyVal
        })
        .then((response)=>{
            console.log('JSON res '+JSON.stringify(response));

            let res = JSON.parse(response);
            if(res?.status == 'success'){
                this.familyList         = res?.data;
                this.needToShowFamily   = true;
            }else{
                this.needToShowFamily     = false;
                this.needToShowProducts   = false;
            }
        })
        .catch((err)=>{
            console.log('JSON err '+JSON.stringify(err));
            this.needToShowFamily   = false;
        })
        .finally(()=>{
            console.log('finally ');
        })
    }




    getRelatedProducts(keyVal){
        console.log('called getRelatedProducts '+keyVal);
        newGetProductsFromStock({
            modalType     :  this.pickedModal,
            familyType    :  keyVal
        })
        .then((response)=>{
            console.log('JSON res '+JSON.stringify(response));

            let res = JSON.parse(response);
            if(res?.status == 'success'){
                this.productList          = res?.data;
                this.needToShowProducts   = true;
            }else{
                this.needToShowProducts   = false;
            }
        })
        .catch((err)=>{
            console.log('JSON err '+JSON.stringify(err));
            this.needToShowProducts   = false;
        })
        .finally(()=>{
            console.log('finally ');
        })
    }







}