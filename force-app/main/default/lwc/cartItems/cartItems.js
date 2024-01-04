import fetchCartItems from '@salesforce/apex/CartItemCtrl.fetchCartItems';
import { NavigationMixin } from "lightning/navigation";
import { LightningElement, track, wire } from 'lwc';

import msgService from '@salesforce/messageChannel/demoMessageChannel__c';
import { MessageContext, subscribe, unsubscribe } from 'lightning/messageService';


export default class CartItems extends NavigationMixin(LightningElement) {


    @wire(MessageContext)
    messageContext

    cartItems;
    @track iscartEmpty;

    connectedCallback(){
        //  refreshApex(this._wiredMyData);
        console.log('In cartItem Connected Callback');

        fetchCartItems()
        .then((res)=>{
            if (res != 0) {
                // refreshApex(this._wiredMyData);
                console.log('connectedCallback fetchCartItems ');

                this.cartItems   = res;
                this.iscartEmpty = true;
            } else if (res == 0) {
                this.cartItems = '';
                this.iscartEmpty = false;
            }
        })
        .catch((err)=>{
            this.error = error;
            this.spinnerStatus = true;
            this.iscartEmpty = false;
        })


        //this.subscription = subscribe(this.messageContext, msgService,(message) => this.cartItemHandler(message));
        this.subscription = subscribe(this.messageContext, msgService, (message) => {
            this.cartItemHandler(message);
            console.log('Message Items : '+JSON.stringify(message)); // Add this line to log the message to the console
        });



    }

    cartItemHandler(message){
        console.log('In Cart Item Handler');
        this.iscartEmpty  = true;
        if(message.cartItems == 0 ||  this.cartItems == undefined || this.cartItems == '' ||message.cartItems == '0' ||  this.cartItems == null ){
            this.cartItems    = '';
            this.iscartEmpty  = false;
        }else{
            this.cartItems    = message.cartItems;

        }
        console.log('Item value in connected callback : '+this.cartItems);
    }

    disconnectedCallback(){
      unsubscribe(this.subscription)
    }


    // _wiredMyData;
    // @wire(fetchCartItems)
    // wirefetchfetchCartItems(wireResultMy) {
    //     const { data, error } = wireResultMy;
    //     this._wiredMyData = wireResultMy;
    //     console.log('Item Count : '+data);
    //         if (data) {
    //             if (data != 0) {
    //                 // refreshApex(this._wiredMyData);
    //                 this.cartItems = data;
    //                 this.iscartEmpty = true;
    //             } else if (data == 0) {
    //                 this.cartItems = '';
    //                 this.iscartEmpty = false;
    //             }
    //         } else if (error) {
    //             this.error = error;
    //             this.spinnerStatus = true;
    //             this.iscartEmpty = false;
    //         }
    // }


    handleNavigate(event){
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: 'shoppingcart',
            }
        });
    }

}