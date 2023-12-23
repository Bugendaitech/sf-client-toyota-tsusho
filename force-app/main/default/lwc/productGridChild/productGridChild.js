import { LightningElement, api, track } from 'lwc';

import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import addProductToCart from '@salesforce/apex/AddToCart_Ctrl.addProductToCart';

export default class ProductGridChild extends NavigationMixin(LightningElement) {

    @api productItems;
    @track childSpinnerStatus = false;


    connectedCallback(){
        console.log('called ProductGridChild');
        // console.log('data ProductGridChild '+JSON.stringify(this.productItems));
    }

    addToCart(event) {
        this.childSpinnerStatus = true;
        console.log('called add to cart');

        let productCode       = event.target.dataset.proCode;

        if(productCode != null){

            addProductToCart({
                productId : productCode,
                qty       : null
            })
            .then((res)=>{
                console.log('in then '+JSON.stringify(res));
                let result    = JSON.parse(res);
                this.notificationHandler(result?.label, result?.msg, result?.status);
            })
            .catch((error)=>{
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

        let pageName = event.target.dataset.name;
        let pageType = event.target.dataset.type;
        let proId    = null;
        let toReturn = null;

        if(event.target.dataset.id != null && event.target.dataset.id != undefined){
            proId    = event.target.dataset.id;
            toReturn = 'home';
        }

        console.log('proId '+proId);

        proId    = btoa(proId);

        console.log('proId '+proId);
        console.log('pageName '+pageName);
        console.log('pageType '+pageType);

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