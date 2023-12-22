import { LightningElement,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

import LightningConfirm from 'lightning/confirm';

export default class CartPage extends NavigationMixin(LightningElement) {

    @track cartArray            = [];
    @track renderd              = true;
    @track productsInCart       = false;
    @track totalSubAmount       = 0;
    @track totalAmount          = 0;
    @track totalGstAmount       = 0;
    @track totalTax             = 0;

    @track taxPercentage        = 0;

    renderedCallback(){
      //console.log('data');
        if(this.renderd){
            this.renderd  = false;
            this.renderData();
        }

    }

    titleCase(str) {
        var splitStr = str.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) {
            // You do not need to check if i is larger than splitStr length, as your for does that for you
            // Assign it back to the array
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        // Directly return the joined string
        return splitStr.join(' ');
     }


     renderData(){

        // let products = localStorage.getItem('LSKey[c]products');
        // console.log('products '+products);

        let productsArray = JSON.parse(localStorage.getItem('LSKey[c]products'));
      //console.log('products '+productsArray);

        if(productsArray == null){
            this.cartArray = [];
            return;
        }

        let finalAmount    = 0;
        let finalGSTAmount = 0;
      //console.log('length '+productsArray.length);

        this.cartArray = productsArray.map(function (
                            currentItem,
                            index,
                            actArray
                        ) {
                            //console.log('currentItem '+JSON.stringify(currentItem));
                            let srNum      = index+1;
                            let subTotal   = ( currentItem.price + currentItem.productGSTPrice ) * currentItem.qty;
                            finalAmount    = finalAmount+subTotal;
                            finalGSTAmount = currentItem.productGSTPrice  * currentItem.qty;
                            //console.log('subTotal '+subTotal);
                            return { ...currentItem, srNum : srNum, subTotal : subTotal };
                        });


                        // console.log('finalAmount '+finalAmount);
                        // console.log('finalGSTAmount '+finalGSTAmount);

                        if(productsArray.length > 0){
                            this.productsInCart   = true;
                        }

                        this.calculateFinalAmount(finalAmount);
                        this.calculateFinalGstAmount(finalGSTAmount);
                      //console.log('JSON '+JSON.stringify(this.cartArray));

    }



    async handleConfirmClick() {
        const result = await LightningConfirm.open({
            message: 'Are you sure, want to empty your Cart?',
            //variant: 'headerless',
            label: 'Warning!',
            theme: 'warning'
            // setting theme would have no effect
        });
        //Confirm has been closed
        //result is true if OK was clicked
        //and false if cancel was clicked

      //console.log('Here '+result);

        if(result){
            //localStorage.clear();
            let cartArray = [];
            localStorage.setItem('LSKey[c]products',JSON.stringify(cartArray));
            //localStorage.clear();
            this.totalAmount    = 0;
            this.totalGstAmount = 0;
            this.totalTax       = 0;
            this.totalSubAmount = 0;
            this.productsInCart = false;
            this.renderData();
        }
    }

    removeProduct(event){
      //console.log('removeProduct called');
      //console.log('event key '+event.target.dataset.key);

        let key           = event.target.dataset.key - 1 ;
        let productsArray = this.cartArray;

        productsArray.splice(key,1);
        this.reAssignKey();
    }

    updateQty(event) {
      //console.log('called');
      //console.log('event key '+event.target.dataset.key);
      //console.log('event action '+event.target.dataset.type);

        let key   = event.target.dataset.key - 1 ;
        let type  = event.target.dataset.type;


        let productsArray = this.cartArray;


        if(type == 'Increase'){
            productsArray[key].qty      = parseInt(productsArray[key].qty)+1;
            productsArray[key].subTotal = ( productsArray[key].price + productsArray[key].productGSTPrice )  * productsArray[key].qty; //( currentItem.price + currentItem.productGSTPrice ) * currentItem.qty;
            this.reAssignKey();

        }else{
            let curQty  = productsArray[key].qty;
            if(curQty == 1){
                //productsArray.splice(key,1,getItemArray);
                productsArray.splice(key,1);
                this.reAssignKey();

            }else{
                productsArray[key].qty      = productsArray[key].qty-1;
                productsArray[key].subTotal = ( productsArray[key].price + productsArray[key].productGSTPrice ) * productsArray[key].qty;

                this.reAssignKey();
            }
        }

        this.cartArray         = productsArray;
        console.log('areay '+JSON.stringify(productsArray));
    }



    reAssignKey(){
      //console.log('called');
        let finalAmount    = 0;
        let finalGstAmount = 0;

        if(this.cartArray.length == 0){
            this.productsInCart = false;
        }

        this.cartArray = this.cartArray.map(function (currentItem, index, actArray) {
            currentItem.srNum = index+1;
            finalAmount    = finalAmount+currentItem.subTotal;
            finalGstAmount = finalGstAmount + (currentItem.productGSTPrice  * currentItem.qty);
            //console.log('finalGstAmount '+finalGstAmount);
            return {...currentItem}
        });

        this.calculateFinalAmount(finalAmount);
        this.calculateFinalGstAmount(finalGstAmount);
        localStorage.setItem('LSKey[c]products',JSON.stringify(this.cartArray));
        // console.log('after '+JSON.stringify(localStorage.getItem('LSKey[c]products')));
    }


    calculateFinalAmount(finalAmount){
        this.totalSubAmount   = finalAmount;
        this.totalTax         = (finalAmount * this.taxPercentage)/100;
        this.totalAmount      = this.totalSubAmount + this.totalTax;
    }

    calculateFinalGstAmount(finalAmount){
        this.totalGstAmount   = finalAmount ;
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