import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import IdOfLoggedInUser from '@salesforce/user/Id'; 


import { getRecord } from 'lightning/uiRecordApi';
import getAllOrders from '@salesforce/apex/Dashboard.getAllOrders';
import getOrderDetails from '@salesforce/apex/Dashboard.getOrderDetails';

const FIELDS = [
    'User.Name',
    'User.FirstName',
    'User.LastName', 
    'User.Email',
    'User.Username',
    'User.MobilePhone', 
    'User.ContactId',
    'User.Contact.AccountId',
    'User.Contact.MailingCity',
    'User.Contact.MailingCountry',
    'User.Contact.MailingPostalCode',
    'User.Contact.MailingState',
    'User.Contact.MailingStreet',
];

export default class Dashboard extends NavigationMixin(LightningElement) {

    userId                      = IdOfLoggedInUser;


    @track spinnerStatus        = false;
    @track modalspinner         = false;
    @track error                = false;
    @track isModelOpen          = false;


    @track records              = [];
    @track totalOrders          = 0; 
    @track title                = 'My Orders ( 0 )';

    @track orderDetails         = null;
    @track orderItems           = [];
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
    @track totalAmount          = 0;
    @track totalTaxt            = 0;
    @track totalFAmount         = 0;
    @track haveLineItems        = false;
    @track haveOrders           = false;

    _userId                     = '';
    _userFName                  = '';
    _userLName                  = '';
    _userEmail                  = '';
    _userMobile                 = '';
    _userStreet                 = '';
    _userCity                   = '';
    _userState                  = '';
    _userZipcode                = '';
    _userId                     = '';
    _userConId                  = '';
    _userAccId                  = '';

    _contractId                 = '';


    @wire(getRecord, { recordId: '$userId', fields: FIELDS })
    wiredRecord({ error, data }) { 
        if (error) {
            // console.log('data error');
            this.spinnerStatus             = true; 
        } else if (data) { 
            console.log('userId '+this.userId);
            if(this.userId != null && this.userId != undefined){
                
                this.isLoggedIn             = true;
                this._userId                = this.userId;
                this._userConId             = data.fields.ContactId.value;
                this._userAccId             = data.fields.Contact.value.fields.AccountId.value;
                this._userFName             = data.fields.FirstName.value;
                this._userLName             = data.fields.LastName.value;
                this._userEmail             = data.fields.Email.value;
                this._userMobile            = data.fields.MobilePhone.value;
                this._userStreet            = data.fields.Contact.value.fields.MailingStreet.value;
                this._userCity              = data.fields.Contact.value.fields.MailingCity.value;
                this._userState             = data.fields.Contact.value.fields.MailingState.value;
                this._userZipcode           = data.fields.Contact.value.fields.MailingPostalCode.value;
                this._userCountry           = data.fields.Contact.value.fields.MailingCountry.value;


                getAllOrders({
                    userId   : this._userAccId
                }).then((data)=>{
                        let rec             = JSON.parse(data);
                        this.records        = [...rec]; 
                        let ordersCount     = rec.length;
                        this.title          = 'My Orders ( '+ordersCount+' )';
                        this.haveOrders     = true;
                }).catch((error)=>{
                    this.error = true;
                    console.log('error '+JSON.stringify(error));
                    this.records = [];
                }).finally(()=>{
                    this.spinnerStatus             = true; 
                })
 
            }
        }

    }


   // ===================== Connected Callback to add year options ===============================

    connectedCallback() {
         this.spinnerStatus     = true;         
    }

    get modelClasses() {
        return this.isModelOpen
          ? "slds-modal slds-p-around_medium slds-modal_small slds-fade-in-open"
          : "slds-modal";
      }

    get modelBackgroundClasses() {
    return this.isModelOpen
        ? "slds-backdrop slds-p-around_medium slds-modal_small slds-backdrop_open"
        : "slds-backdrop";
    }

    // wire function for fetch Orders
    // _wiredMyData;
    // @wire(getAllOrders,
    //     {
    //         userId   : '$_userAccId'
    //     })
    // wireProductList(wireResultMy) {

    //     const { data, error } = wireResultMy;
    //     this._wiredMyData     = wireResultMy;
    //     if (data) { 
    //         //console.log('data '+data);
    //         if (data.length > 0) {
    //             let rec             = JSON.parse(data);
    //             this.records        = [...rec]; 
    //             let ordersCount     = rec.length;
    //             this.title          = 'My Orders ( '+ordersCount+' )';
    //         } else if (data.length == 0) { 
    //             this.records = [];
    //         }

    //     } else if (error) {
    //         this.error = true;
    //     }
    // }

    // ===================== fetch Order details  ====================================c/carousel
    fetchOrderDetails(event){
        
        this.isModelOpen = true;
        let orderId      = event.target.dataset.id;
        getOrderDetails({
            ordId : orderId
        })
        .then((result)=>{
            // console.log('result ::'+result);
            let  orderDetails    = JSON.parse(result);
             
            this.orderNumber     = orderDetails.OrderNumber;
            this.orderDate       = orderDetails.EffectiveDate;
            this.totalAmount     = orderDetails.TotalAmount;
            if(orderDetails.OrderItems != null || orderDetails.OrderItems != undefined){
                this.orderItems      = orderDetails.OrderItems.records;
                if(orderDetails.OrderItems.records.length > 0 ){
                    this.haveLineItems = true;
                }
            }            
            this.orderUserName   = orderDetails.Account.Name;
            this.orderUserEmail  = 'retail@bugendaitech.com';
            this.orderUserMobile = orderDetails.Account.Phone;
            this.orderUserAddress= orderDetails.Account.BillingStreet;
            this.orderUserZipcode= orderDetails.Account.BillingPostalCode;
            this.orderUserState  = orderDetails.Account.BillingState;
            this.orderUserCity   = orderDetails.Account.BillingCity;
            this.orderUserCountry= orderDetails.Account.BillingCountry;
            this.modalspinner    = true;
        })
        .catch((error)=>{
            console.log('error ::'+error)
        })
        .finally(()=>{
            console.log('finally ::')
        })

    }


    closeModal(){
        this.isModelOpen     = false;
        this.modalspinner    = false;
    }


    // ===================== handle Navigation handler ===============================
    handleNavigation(event){

        let pageName = event.target.dataset.name;
        let pageType = event.target.dataset.type;

        this[NavigationMixin.Navigate]({
            type: pageType,
            attributes: {
                pageName: pageName,
            },
        });        
            
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