import getOrderDetails from '@salesforce/apex/showOrdersCtrl.getOrderDetails';
import getOrderItemDetails from '@salesforce/apex/showOrdersCtrl.getOrderItemDetails';
import updateOrder from '@salesforce/apex/showOrdersCtrl.updateOrder';
import IdOfUser from '@salesforce/user/Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import { LightningElement, track, wire } from 'lwc';

const FIELDS = [
    'User.Name',
    'User.isDealer__c',
]

export default class ShowOrders extends LightningElement {

    userId = IdOfUser;
    @track records  = [];
    @track orderItemRecords = [];
    @track spinnerStatus = false;
    @track haveData = false;
    @track profileName;
    @track isDealer;
    @track showOrder;
    @track isViewOrderedProductOpen = false;

    @track orderNumber          = '';
    @track orderDate            = '';
    @track orderUserName        = '';
    @track orderUserEmail       = '';
    @track orderUserMobile      = '';
    @track orderUserAddress     = '';
    @track orderUserCity        = '';
    @track orderUserState       = '';
    @track orderUserZipcode     = '';
    @track orderUserCountry     = '';

    
    get editOrderClassJob(){
        return this.isViewOrderedProductOpen
        ? "slds-modal slds-modal_small slds-fade-in-open slds-scrollable_y"
        : "slds-modal";
      }

      get editOrderClassJobDetails() {
        return this.isViewOrderedProductOpen
          ? "slds-backdrop slds-p-around_medium slds-modal_small slds-backdrop_open"
          : "slds-backdrop";
    }


    @wire(getRecord, { recordId: '$userId', fields: FIELDS })
    wiredRecord({ error, data }) {

        if (error) {

            let message = 'Unknown error';
            if (Array.isArray(error.body)) {
                message = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                message = error.body.message;
            }
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading Account',
                    message,
                    variant: 'error',
                }),
            );

        } else if (data) {
            console.log('User data : '+JSON.stringify(data));
            this.isDealer = data.fields.isDealer__c.value;
       
        }

    }

    _wiredMyData;
    @wire(getOrderDetails)
    wiregetOrderDetails(wireResultMy) { 
        const { data, error } = wireResultMy;
        this._wiredMyData = wireResultMy;
        console.log('Records : '+data);
            if (data) {
                if (data.length > 0) {
                    this.records = JSON.parse(data);
                    // this.records = this.records.map(item => {
                    //     console.log('Items :'+item);
                    //     return {
                    //         ...item,
                    //         Name: item.Account.Name
                    //     };
                    // });
                    this.haveData = true;
                    this.spinnerStatus = true;
                } else if (data.length == 0) {
                    this.records = []; 
                    this.spinnerStatus = true;
                    this.haveData = false;
                }
            } else if (error) {
                this.error = error;
                this.spinnerStatus = true;
                this.haveData = false;
            }
    }

    handleUpdate(event){
        let status = event.target.dataset.status;
        let recId = event.target.dataset.id;
        console.log('Status : '+status);
        console.log('recId : '+recId);
        updateOrder({ orderId: recId, status: status })
        .then(data => {
            console.log(data);
            if(data=='Success'){
                this.notificationHandler('Success', 'Order '+status, 'success'); 

            }else{
                this.notificationHandler('Error', 'Order Not Updated', 'error'); 
            }
             
        }).catch(error => {
            console.log('LWC error');
    
        })
    }

    handleViewOrderedProduct(event){
        this.isViewOrderedProductOpen = true;
        console.log(event.target.dataset.id);
      
        let orderId = event.target.dataset.id;
        console.log('orderId : '+orderId);
        getOrderItemDetails({
            orderId: orderId
          })
          .then((result) => {
            this.orderItemRecords = JSON.parse(result);
            this.orderItemRecords = this.orderItemRecords.map(item => {
                return {
                    ...item,
                    Product: item.Product2.Name,
                    Description: item.Product2.Description,
                    ProductFamily: item.Product2.Family,
                    GST: item.Product2.GST__c,
                    Image: item.Product2.Product_Image__c
                   
                };
            });
            this.orderDate       = this.orderItemRecords[0].Order.EffectiveDate;
            this.orderNumber     = this.orderItemRecords[0].Order.OrderNumber;
            this.orderUserName   = this.orderItemRecords[0].Order.Account.Name;
            // this.orderUserEmail  = 'retail@bugendaitech.com';
            this.orderUserMobile = this.orderItemRecords[0].Order.Account.Phone;
            this.orderUserAddress= this.orderItemRecords[0].Order.BillingStreet;
            this.orderUserZipcode= this.orderItemRecords[0].Order.BillingPostalCode;
            this.orderUserState  = this.orderItemRecords[0].Order.BillingState;
            this.orderUserCity   = this.orderItemRecords[0].Order.BillingCity;
            this.orderUserCountry= this.orderItemRecords[0].Order.BillingCountry;
            console.log('Result of orderItem : ' +result)
            })
          .catch((error) => {
            this.orderItemRecords =  [];
            console.log('Error of orderItem : ' + JSON.stringify(error))
          })
          .finally(() => {   })
    }

    handleCancel(){
        this.isViewOrderedProductOpen = false;
    }

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