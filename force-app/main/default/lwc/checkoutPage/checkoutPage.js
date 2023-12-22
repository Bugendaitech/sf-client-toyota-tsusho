import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { LightningElement, track, wire } from 'lwc';

import IdOfLoggedInUser from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';

import checkoutProcess from '@salesforce/apex/Checkout.checkoutProcess';

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

// Contact__c

export default class CheckoutPage extends NavigationMixin(LightningElement) {

    userId                      = IdOfLoggedInUser;

    @track spinnerStatus        = false;
    @track cartArray            = [];
    @track renderd              = true;
    @track productsInCart       = false;
    @track totalSubAmount       = 0;
    @track totalAmount          = 0;
    @track totalTax             = 0;

    // card variables
    @track nameOnCard           = '';
    @track selYear              = '';
    @track selMonth             = '';
    @track selCvv               = '';
    @track selCardNum           = '';

    @track isLoggedIn           = false;
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

    @track taxPercentage        = 0;

           bufferMonthArray     = [
            { label: '01', value: '01' },
            { label: '02', value: '02' },
            { label: '03', value: '03' },
            { label: '04', value: '04' },
            { label: '05', value: '05' },
            { label: '06', value: '06' },
            { label: '07', value: '07' },
            { label: '08', value: '08' },
            { label: '09', value: '09' },
            { label: '10', value: '10' },
            { label: '11', value: '11' },
            { label: '12', value: '12' }
        ]

    years = [];

// ===================== Month Options ===============================
    months = [];

    states = [
        { label: 'California', value: 'California' },
        { label: 'Karnataka', value: 'Karnataka' },
    ]

   // ===================== Connected Callback to add year options ===============================

   @wire(getRecord, { recordId: '$userId', fields: FIELDS })
    wiredRecord({ error, data }) {
        this.spinnerStatus   = false;
        console.log('User Data : '+JSON.stringify(data));
        if (error) {
            // console.log('data error');
            this.spinnerStatus          = true;
        } else if (data) {

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
                this.spinnerStatus          = true;
                //this._contractId            = ''
            }
        }

    }

    connectedCallback() {

        console.log('userId '+this.userId);

        this.months       = [...this.bufferMonthArray];
        const currentYear = new Date().getFullYear();

        for (let i = currentYear; i <= currentYear + 10; i++) {
            this.years.push({
                label: i.toString(),
                value: i.toString()
            });
        }



        this.renderData();
    }


    // ===================== handle Navigation handler ===============================
    handleNavigation(event){

        let pageName = event.target.dataset.name;
        let pageType = event.target.dataset.type;

    //   console.log('pageName '+pageName);
    //   console.log('pageName '+pageType);
    //   return;

        // if(pageName == 'checkout'){
        //     if(!this.productsInCart){
        //         this.notificationHandler('Warning', 'Your cart is empty.', 'warning');
        //         return;
        //     }
        // }

        if(pageType == 'comm__loginPage'){
            // console.log('he');
            this[NavigationMixin.Navigate]({
                type: pageType,
                attributes: {
                    actionName: pageName,
                },
            });
        }else{
            // console.log('he');
            this[NavigationMixin.Navigate]({
                type: pageType,
                attributes: {
                    pageName: pageName,
                },
            });
        }


    }

    renderData(){

        let productsArray = JSON.parse(localStorage.getItem('LSKey[c]products'));

        // if(productsArray == null){
        //     // this.cartArray = [];
        //     this.notificationHandler('Warning!!', 'Your Order is Empty.', 'warning');
        //         this[NavigationMixin.Navigate]({
        //             type: 'standard__namedPage',
        //             attributes: {
        //                 pageName: 'home',
        //             },
        //         });
        //     return;
        // }

        let finalAmount = 0;
        let subTotal    = 0;
        productsArray.forEach(element => {

            subTotal      = element.price * element.qty;
            finalAmount   = finalAmount+subTotal;
        });
        this.calculateFinalAmount(finalAmount);
        this.spinnerStatus = true;

    }

    handleCardValues(event){
        // console.log('called');
        // console.log('called '+JSON.stringify(event.target.label));

        let label       =  event.target.label;
        let value       =  event.target.value;


        //selYear selMonth selCvv selCardNum


        if(label == 'Full Name on card'){

            this.nameOnCard      = value;

        }else if(label == 'Card Number'){

            this.selCardNum      = value;

        }else if(label == 'Month'){

            this.selMonth        = value;

        }else if(label == 'Year'){

            let currentYear = new Date().getFullYear();
            this.selYear    = value;

            if(value == currentYear){
              //console.log('matched');

                let curMonth   = new Date().getMonth();
                let monthArray = [...this.bufferMonthArray];
                this.months    = monthArray.slice(curMonth);

              //console.log('bufferMonthArray '+JSON.stringify(this.bufferMonthArray));
            }else{
                this.months    = [...this.bufferMonthArray];
            }

        }else if(label == 'CVV'){

            this.selCvv = value;
        }


    }

    calculateFinalAmount(finalAmount){
        this.totalSubAmount   = finalAmount;
        this.totalTax         = (finalAmount * this.taxPercentage)/100;
        this.totalAmount      = this.totalSubAmount + this.totalTax;
    }


    handlePay(){

        if(!this.isLoggedIn){
            this.notificationHandler('Error', 'Please Login to Checkout.', 'error');
        }else{
            //this.notificationHandler('Success', 'Thank You!! Your Order is in Progress.', 'success');
            // console.log('this.nameOnCard : '+this.nameOnCard);
            // console.log('this.selCardNum : '+this.selCardNum);
            // console.log('this.selMonth : '+this.selMonth);
            // console.log('this.selYear : '+this.selYear);
            // console.log('this.selCvv : '+this.selCvv);
            // console.log('this._userLName : '+this._userLName);
            // console.log('this._userEmail : '+this._userEmail);
            if(
                this.nameOnCard == '' || this.selCardNum == '' || this.selCardNum == 'none' ||
                this.selMonth  == '' || this.selMonth == 'none' ||
                this.selYear   == '' || this.selYear == 'none' ||
                this.selCvv  == '' || this.selCvv == 'none' ||
                this._userLName == '' || this._userEmail == ''
                ){
                    this.notificationHandler('Error', 'Please fill all required fields.', 'error');
                    return;
            }

            this.spinnerStatus = false;
            //console.log('inside');
            let lineItemDataList = [];
            let productsArray    = JSON.parse(localStorage.getItem('LSKey[c]products'));

            //console.log('productsArray :: '+JSON.stringify(productsArray));

            productsArray.forEach(element => {

                let orderItem                =  new Object();
                orderItem.Quantity           =  element.qty;
                orderItem.UnitPrice          =  element.price;
                orderItem.Product2Id         =  element.code

                lineItemDataList.push(orderItem);
            });


            //console.log('lineItemDataList :: '+JSON.stringify(lineItemDataList));

            let orderDetials                    =  new Object();
                orderDetials.AccountId          =  this._userAccId;
                orderDetials.Contact__c         =  this._userConId;

            //console.log('orderDetials :: '+JSON.stringify(orderDetials));

            checkoutProcess({
                orderDetails   : JSON.stringify(orderDetials),
                lineItems      : JSON.stringify(lineItemDataList)
            })
            .then((result)=>{

                //console.log('result '+JSON.stringify(result));
                this.spinnerStatus = true;
                //localStorage.clear();
                let cartArray = [];

                localStorage.setItem('LSKey[c]products',JSON.stringify(cartArray));
                this.notificationHandler('Thank You!!', 'Your Order created Successfully.', 'success');
                this[NavigationMixin.Navigate]({
                    type: 'standard__namedPage',
                    attributes: {
                        pageName: 'home',
                    },
                });
            })
            .catch((error)=>{
                this.spinnerStatus = true;
                console.log('error '+JSON.stringify(error));
                this.notificationHandler('Error', error, 'error');
            })
            .finally(()=>{
              //console.log('finally ');
            })


        }
    }


    handleReset(){
      //console.log('clicked ');

      //console.log('Cur Value :');
      //console.log('Cur Value :'+this.template.querySelector('[data-field="month"]').value);
        this.template.querySelector('[data-field="month"]').value = 'none';
      //console.log('Value :'+this.template.querySelector('[data-field="month"]').value);
      //console.log('clicked ');
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