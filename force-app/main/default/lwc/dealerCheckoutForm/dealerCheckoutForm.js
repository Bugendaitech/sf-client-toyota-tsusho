import { LightningElement, track, wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOrderDetails from '@salesforce/apex/DealerOrderFormController.getOrderDetails';
import getShipToAddress from '@salesforce/apex/CreateOrdersfromCart.getShipToAddress';
import getHeadOfficeAddress from '@salesforce/apex/CreateOrdersfromCart.getHeadOfficeAddress';
import createOrders from '@salesforce/apex/CreateOrdersfromCart.createOrders';
getHeadOfficeAddress

export default class DealerCheckoutForm extends NavigationMixin(LightningElement) {


    @track cartArray            = [];
    @track renderd              = true;
    @track productsInCart       = false;
    @track totalSubAmount       = 0;
    @track totalAmount          = 0;
    @track totalTax             = 0;

    @track taxPercentage        = 0;

    selectedAddress = '';
    addressOptions = [];
    headOfficeAddress = '';
    @track TotalAmtInWords = '';
    TodayDate;

    
    connectedCallback(){
        let todayDate = new Date();
        const dateStr = new Intl.DateTimeFormat('en', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        })
        const [{value: mo}, , {value: da}, , {value: ye}] = dateStr.formatToParts(todayDate);

        let formatedDate = `${da}-${mo}-${ye}`;
        this.TodayDate=formatedDate;
        
    }

    renderedCallback(){
      //console.log('data');
        if(this.renderd){
            this.renderd  = false;
            this.renderData();
        }

    }

    @track showButton = true;
    @track showForm = false;
     productData = [];
     error ;
     zoneData =
     [{Region: "South India", Mark:"", Days:"2 days"},
     {Region:"West India", Mark:"", Days:"5 days"},
     {Region: "North India", Mark:"",Days:"6 days"},
     {Region: "East India", Mark:"", Days:"8 days"},
     {Region:  "North East/ J&K region", Mark:"", Days:"11 days"}];


    // @wire(getOrderDetails)
    // getOdrers({ error, data }) {
    //     if (data) {
    //         console.log(data);
    //         this.productData = data;
    //         //this.productData = JSON.stringify(data);
    //         this.error = undefined;
    //     console.log('Orders == '+ this.productData);
    //     } else if (error) {
    //         this.error = error;
    //     }
    // }

    //CurrentLogggedin HO address
    @wire(getHeadOfficeAddress)
    wiredgetHeadOfficeAddress({ error, data }) {
        if (data) {
            console.log('HO address '+data);
            this.headOfficeAddress = data;
        } else if (error) {
            // Handle error
            console.error(error);
        }
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

        let finalAmount = 0;
      //console.log('length '+productsArray.length);

        this.cartArray = productsArray.map(function (
                            currentItem,
                            index,
                            actArray
                        ) {
                            let srNum     = index+1;
                            let subTotal  = currentItem.price * currentItem.qty;
                            finalAmount   = finalAmount+subTotal;
                            return { ...currentItem, srNum : srNum, subTotal : subTotal };
                        });

                        if(productsArray.length > 0){
                            this.productsInCart   = true;
                        }

                        this.calculateFinalAmount(finalAmount);
                      //console.log('JSON '+JSON.stringify(this.cartArray));


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

    calculateFinalAmount(finalAmount){
        this.totalSubAmount   = finalAmount;
        this.totalTax         = (finalAmount * this.taxPercentage)/100;
        this.totalAmount      = this.totalSubAmount + this.totalTax;
        this.TotalAmtInWords = this.numberToWords(this.totalAmount);
    }

    //console.log('testin');

    handleDealerOrderFormClick(event) {
        this.showButton = false;
        this.showForm = true;
        // Handle the click event for the "Warranty" button here
        // You can add your logic to navigate to a specific URL or perform other actions
        //alert('DealerOrderForm button clicked!');
    }


    //get Address for the dropdown
    @wire(getShipToAddress)
    wiredAddresses({ error, data }) {
        if (data) {
            this.addressOptions = data.map(account => ({
                label: account.BillingStreet + ', ' + account.BillingCity + ', ' + account.BillingState + ' ' + account.BillingPostalCode,
                value: account.Id
            }));
        } else if (error) {
            // Handle error
            console.error(error);
        }
    }

    handleAddressChange(event) {
        this.selectedAddress = event.detail.value;
        console.log('selected Addr '+this.selectedAddress );
    }

    handleCreateOrder(){
        if(this.selectedAddress == ''){
            // alert('Select Ship to Address!!');
            this.notificationHandler('Error', 'Please Select Ship To Address.', 'error');
            return;
        }
        else{
            let lineItemDataList = [];
            let productsArray    = JSON.parse(localStorage.getItem('LSKey[c]products'));
            let totalGSTAmt = 0;

            productsArray.forEach(element => {

                let fullAmount               = element.price + element.productGSTPrice;
                let orderItem                =  new Object();
                orderItem.Quantity           =  element.qty;
                orderItem.UnitPrice          =  fullAmount;
                orderItem.Product2Id         =  element.code;
                orderItem.GST_Amount__c    =  element.productGSTPrice * element.qty;

                lineItemDataList.push(orderItem);
                totalGSTAmt =totalGSTAmt + (element.productGSTPrice * element.qty);
                console.log('total gst '+totalGSTAmt);
            });

            let orderDetails                = new Object();
            orderDetails.Status             = 'Draft';
            orderDetails.Total_GST_Amount__c = totalGSTAmt;


            console.log('order details-> '+JSON.stringify(orderDetails));
            console.log('order item-> '+JSON.stringify(lineItemDataList));


            createOrders({
                orderDetails   : JSON.stringify(orderDetails),
                lineItems      : JSON.stringify(lineItemDataList),
                address        : this.selectedAddress
            })
            .then(result=>{
                 console.log('result '+JSON.stringify(result));
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


        }
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

    numberToWords(number) {
 
        const ones = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
     
        const teens = ['Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
     
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        function convertToWords(n) {
     
            if (n < 10) return ones[n];
     
            else if (n >= 11 && n <= 19) return teens[n - 11];
     
            else if (n >= 10 && n <= 99) return tens[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + ones[n % 10] : '');
     
            else if (n >= 100 && n <= 999) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 > 0 ? ' and ' + convertToWords(n % 100) : '');
     
            else if (n >= 1000 && n <= 99999) return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 > 0 ? ' ' + convertToWords(n % 1000) : '');
     
            else if (n >= 100000 && n <= 9999999) return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 > 0 ? ' ' + convertToWords(n % 100000) : '');
     
            else return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 > 0 ? ' ' + convertToWords(n % 10000000) : '');
     
        }
        let rupees = Math.floor(number);
     
        let paise = Math.round((number - rupees) * 100);
        let words = convertToWords(rupees) + ' Rupees';
     
        if (paise > 0) words += ' and ' + convertToWords(paise) + ' Paise';
     
        console.log('words-> ',words);
        return words;
     
    }
    
}