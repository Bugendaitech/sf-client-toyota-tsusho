import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { LightningElement, track, wire } from 'lwc';

import LightningConfirm from 'lightning/confirm';

// import addProductToCart from '@salesforce/apex/AddToCart_Ctrl.addProductToCart';


import actionOnQuantity from '@salesforce/apex/AddToCart_Ctrl.actionOnQuantity';
import emptyCart from '@salesforce/apex/AddToCart_Ctrl.emptyCart';
import getAllCartItems from '@salesforce/apex/AddToCart_Ctrl.getAllCartItems';

import msgService from '@salesforce/messageChannel/demoMessageChannel__c';
import { MessageContext, publish } from 'lightning/messageService';

export default class CartPage extends NavigationMixin(LightningElement) {

    @track cartArray            = [];
    @track renderd              = true;
    @track productsInCart       = false;
    @track childSpinnerStatus   = false;
    @track totalSubAmount       = 0;
    @track totalAmount          = 0;

    @track wiredAccountList     = [];

    @track totalGstAmount       = 0;
    @track totalExeAmt          = 0;
    @track totalIncAmt          = 0;
    @track totalTax             = 0;
    @track taxPercentage        = 0;



    @wire(MessageContext)
    messageContext


    connectedCallback(){
        this.cartArray           = [];
        this.childSpinnerStatus  = false;
        getAllCartItems()
        .then((res)=>{
            let result  = JSON.parse(res);

            console.log(' Data Apex : ' + JSON.stringify(result));
            // console.log('size '+this.cartArray.length);

            if(result?.items != null){
                this.formatCartArray(result.items);
            }

            this.totalGstAmount     = result?.totalGstAmt;
            this.totalExeAmt        = result?.totalExeAmt;
            this.totalIncAmt        = result?.totalIncAmt;
            this.publishOrderItemLMS(result);
        })
        .catch((err)=>{
            let result    = JSON.parse(err);
            this.notificationHandler('Error !', result?.body?.message, 'error');
        })
        .finally(()=>{

            this.childSpinnerStatus  = true;
        })
    }



    formatCartArray(result){

        let cartItems  = [];

        if(Object.keys(result).length > 0){


            let keyArray = Object.keys(result);
            keyArray.sort(function(a, b){return a - b});
            keyArray.forEach(element => {
                let obj  = {
                    gst    : element,
                    items  : result[element],
                }
                cartItems = [...cartItems, obj];
            });

            // console.log(JSON.stringify(cartItems));
            this.cartArray       = cartItems;
            this.productsInCart  = true;
        }else{
            this.productsInCart  = false;
        }


    }

    


    async handleConfirmClick() {
        const result = await LightningConfirm.open({
            message: 'Are you sure, want to empty your Cart?',
            //variant: 'headerless',
            label: 'Warning!',
            theme: 'warning'
            // setting theme would have no effect
        });

        if(result){
            this.childSpinnerStatus  = false;
            //localStorage.clear();
            emptyCart()
            .then((res)=>{
                // console.log('then '+JSON.stringify(res));
                let result              = JSON.parse(res);
                this.cartArray          = [];
                this.productsInCart     = false;
                this.totalGstAmount     = 0;
                this.totalExeAmt        = 0;
                this.totalIncAmt        = 0;
                let cartItems           = 0;
                this.notificationHandler(result?.label, result?.msg, result?.status);
                let payload   = {cartItems : cartItems}
                console.log('Total Items : '+JSON.stringify(payload));

                publish(this.messageContext, msgService, payload);
            })
            .catch((err)=>{
                console.log('err '+JSON.stringify(err));
                let result    = JSON.parse(err);
                this.notificationHandler(result?.label, result?.msg, result?.status);
            })
            .finally(()=>{
                console.log('empty');
                this.childSpinnerStatus  = true;
            })

        }
    }


    actionOnQuantity(event) {

        let pId   = event.target.dataset.key;
        let type  = event.target.dataset.type;
        let qty   = null;

        console.log('here ');

        if(type == 'manual'){
            qty   = event.target.value;
            if(qty <= 0){
                this.notificationHandler('Error !', 'Valid Quantity between 1 to 1000', 'error');
                return;
            }
        }

        if(type == 'decrease' || type == 'increase'){
            qty = 1;
        }



        console.log('pid '+pId +' && '+type+' qty '+qty);

        if(pId != null && type != null){
            this.childSpinnerStatus  = false;
            actionOnQuantity({
                actionType : type,
                cartId     : pId,
                qty        : qty
            })
            .then((res)=>{
                console.log('then '+JSON.stringify(res));
                let result    = JSON.parse(res);
                let cartItems = result.totalItems;
                let payload   = {cartItems : cartItems}
                console.log('Total Items : '+JSON.stringify(payload));

                publish(this.messageContext, msgService, payload);

                this.itemResultHandler(result);
                // this.publishOrderItemLMS(result);

            })
            .catch((err)=>{
                console.log('err '+JSON.stringify(err));
                let result    = JSON.parse(err);
                this.notificationHandler('Error !', result?.body?.message, 'error');
            })
            .finally(()=>{
                console.log('finally');
                this.childSpinnerStatus  = true;
                refreshApex(this.wiredAccountList);
            })
      }
    }

    // ===================== handle Navigation handler ===============================
    handleNavigation(event){

        let pageName = event.target.dataset.name;
        let pageType = event.target.dataset.type;
        let proId    = null;
        let toReturn = null;

        if(event.target.dataset.id != null && event.target.dataset.id != undefined){
            proId    = event.target.dataset.id;
            proId    = btoa(proId);
            toReturn = 'shoppingcart';
        }


      //console.log('pageName '+pageName);
      //console.log('pageName '+pageType);

        if(pageName == 'checkout'){
            // this.notificationHandler('Warning', 'In Progress.', 'warning');
            //     return;
            if(!this.productsInCart){
                this.notificationHandler('Warning', 'Your cart is empty.', 'warning');
                return;
            }
        }

        if(proId != null){
            this[NavigationMixin.Navigate]({
                type: pageType,
                attributes: {
                    pageName: pageName,
                },
                state: {
                  productCode: proId,
                  return     : toReturn
                }
            });
        }else{
            this[NavigationMixin.Navigate]({
                type: pageType,
                attributes: {
                    pageName: pageName,
                }
            });
        }
    }

    itemResultHandler(result){

            if(result?.items != null){
                this.formatCartArray(result.items);
            }
            this.notificationHandler(result?.label, result?.msg, result?.status);
            this.totalGstAmount     = result?.totalGstAmt;
            this.totalExeAmt        = result?.totalExeAmt;
            this.totalIncAmt        = result?.totalIncAmt;
    }

    publishOrderItemLMS(result){

         let cartItems = result.totalItems;
        //let itemValues = Object.values(result.items);
        //let cartItems = itemValues.length > 0 ? itemValues[0][0].qty : '';

        console.log('Total Items After Update Quantity : '+cartItems)
        let payload = {cartItems : cartItems}
        console.log('Total Items : '+JSON.stringify(payload));

        publish(this.messageContext, msgService, payload);
        console.log('Message Published');
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