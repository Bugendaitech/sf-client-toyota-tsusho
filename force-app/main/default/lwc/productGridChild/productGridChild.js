import { LightningElement, api, track, wire } from 'lwc';

import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import addProductToCart from '@salesforce/apex/AddToCart_Ctrl.addProductToCart';

import msgService from '@salesforce/messageChannel/demoMessageChannel__c';
import { MessageContext, publish } from 'lightning/messageService';

export default class ProductGridChild extends NavigationMixin(LightningElement) {

    //@api productItems;

    @api productItems         = [];
    @api breadcurmbsItems     = [];
    @track childSpinnerStatus = false;
    @track payload;


    @wire(MessageContext)
    messageContext



    connectedCallback(){
        console.log('DemoProductGridChild');
        console.log('productList '+JSON.stringify(this.productItems));
    }


    addToCart(event) {
        this.childSpinnerStatus = true;
        console.log('called add to cart');

        let productCode       = event.target.dataset.proCode;
        console.log('called add to cart '+productCode);

        if(productCode != null){

            addProductToCart({
                productId : productCode,
                qty       : null
            })
            .then((res)=>{
                console.log('in then '+JSON.stringify(res));
                let result    = JSON.parse(res);
                let cartItems = result.totalItems;
                this.payload = {cartItems : cartItems};
                console.log('Total Items : '+JSON.stringify(this.payload));
                if(result.status != 'warning'){

                    publish(this.messageContext, msgService, this.payload);
                    console.log('Message Published');
                }
                this.notificationHandler(result?.label, result?.msg, result?.status);
            })
            .catch((error)=>{
                console.log('payload : '+this.payload);
               // this.payload = {cartItems : cartItems};
                publish(this.messageContext, msgService, this.payload);
                console.log('in catch '+JSON.stringify(error));
                let result    = JSON.parse(error);
                this.notificationHandler('Error !', result?.body?.message, 'error');
            })
            .finally(()=>{
                console.log('finally');
                this.childSpinnerStatus = false;

            })
        }

    }




    handleNavigation(event){

        event.preventDefault();
        console.log('called');


        let pageName = event.target.dataset.name;
        let pageType = event.target.dataset.type;
        let proName  = event.target.dataset.proname;
        let proId    = event.target.dataset.id;
        let breadcurmbsItemsLocal = JSON.parse(JSON.stringify(this.breadcurmbsItems));

        // let proId    = null;
        let toReturn = null;
        console.log('called 2');
        if(event.target.dataset.id == null || event.target.dataset.id == undefined){
            return;
        }

        console.log('proId '+proId);
        console.log('bread '+JSON.stringify(breadcurmbsItemsLocal));



        // console.log('proId '+proId);
        // console.log('pageName '+pageName);
        // console.log('pageType '+pageType);

        const objIdToFind            = proName;
        const indexOfObj             = breadcurmbsItemsLocal.findIndex(p => p.label === objIdToFind);
        console.log('indexOfObj '+indexOfObj);


        if (indexOfObj == -1) {            // As find return object else undefined
        console.log('called 3');

            let breadCurmbObj        =  {
                label    : proName,
                name     : proName,
                type     : 'self',
                isActive : true
            };
        console.log('called 3.0');

                breadcurmbsItemsLocal.forEach(obj => {
                    console.log('obj '+JSON.stringify(obj));
                    obj.isActive = false;
                });
              console.log('called 3.11');
              breadcurmbsItemsLocal.push(breadCurmbObj);
        console.log('called 3.1 bread '+JSON.stringify(breadcurmbsItemsLocal));

        }
        console.log('called 4');

        proId    = btoa(proId);
        console.log('called 5');

        toReturn = btoa(JSON.stringify(breadcurmbsItemsLocal));

        console.log('bread '+JSON.stringify(breadcurmbsItemsLocal));

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

    @api
    cleanProductList(arr){
         this.productItems = arr;
         //console.log('filter called');
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

	handleReset(event) {
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }



}