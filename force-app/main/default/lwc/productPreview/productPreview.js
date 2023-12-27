import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


import getProductDetails from '@salesforce/apex/StockProducts_Ctrl.getProductDetails';
import addProductToCart from '@salesforce/apex/AddToCart_Ctrl.addProductToCart';

export default class ProductPreview extends NavigationMixin(LightningElement) {

    @wire(CurrentPageReference) pageRef;
    @track recId    = null;
    @track toReturn = null;

    //============== product variable

    @track proCode         = '';
    @track proFamily         = '';
    @track proName         = '';
    @track proUnitPrice    = 0;
    @track proWestCode    = '';
    @track proFullDesc     = '';
    @track proImg          = '';
    @track proUom          = '';
    @track proGst          = 0;

    @track productDetails  = null;

    connectedCallback() {

      //console.log('connectedCallback ');
      //console.log('connectedCallback '+JSON.stringify(this.pageRef.state.productCode));

        if(this.pageRef.state && this.pageRef.state.return){
            let retPage = this.pageRef.state.return;
             console.log('retPage '+retPage);
            this.toReturn  = retPage;
        }


        if (this.pageRef.state && this.pageRef.state.productCode) {
            let recordId = this.pageRef.state.productCode;
          //console.log('recordId '+recordId);
            // Do something with the record ID
            recordId    = atob(recordId);
            this.recId  = recordId;

            getProductDetails({
                productId : recordId
            })
            .then((result)=>{
                //console.log('result '+result);
                this.productDetails         = JSON.parse(result);
                this.proCode                = this.productDetails.proCode;
                this.proUom                 = this.productDetails.proUom;
                this.proFamily              = this.productDetails.family;
                this.proName                = this.productDetails.name;
                this.proUnitPrice           = this.productDetails.unitPrice;
                this.proWestCode            = this.productDetails.westCode;
                this.proFullDesc            = this.productDetails.fullDesc;
                this.proImg                 = this.productDetails.imgSrc;
                this.proGst                 = this.productDetails.gst;
            })
            .catch((error)=>{
                //console.log('error '+error);
                console.log('in catch '+JSON.stringify(error));
                let result    = JSON.parse(error);
                this.notificationHandler(result?.label, result?.msg, result?.status);
            })
            .finally(()=>{
              //console.log('finally ');
            })
        }

    }


    // addToCart(){

    //     let proQty      = this.template.querySelector("[data-field='proQty']").value;
    //     let proId       = this.recId;
    //     let proPrice    = this.productDetails.unitPrice;

    //   //console.log('proQty '+proQty);
    //   //console.log('proId '+proId);
    //   //console.log('proPrice '+proPrice);

    // }

    addToCart() {

        console.log('called add to cart');

        let productCode       = this.recId;
        let qty               = this.template.querySelector("[data-field='proQty']").value;

        console.log('this '+qty);

        if(qty < 1){
            this.notificationHandler('Warning', 'Minimum Quantity should be One.', 'warning');
            return;
          }

        if(productCode != null){

            addProductToCart({
                productId : productCode,
                qty       : qty
            })
            .then((res)=>{
                console.log('in then '+res);
                let result    = JSON.parse(res);
                this.notificationHandler(result?.label, result?.msg, result?.status);
            })
            .catch((error)=>{
                console.log('in catch '+JSON.stringify(error));
                let result    = JSON.parse(error);
                this.notificationHandler(result?.label, result?.msg, result?.status);
            })
            .finally(()=>{
                console.log('finally');

            })
        }

    }


    // oldAddToCart() {

    //   //console.log('called add to cart');

    //     let productCode       = this.recId;

    //     // let selectedProduct   = this.records.filter(function (el) {
    //     //                             return el.Id == productCode;
    //     //                         });

    //     // console.log('selectedProduct '+JSON.stringify(selectedProduct));

    //     let productQty        = this.template.querySelector("[data-field='proQty']").value;
    //     let productTitle      = this.proFullDesc;
    //     let productPrice      = this.proUnitPrice;
    //     let productImg        = this.proImg;
    //     let productUom        = this.proUom;
    //     let productItemCode   = this.proCode;
    //     let productGST        = this.proGst;


    //     if(productQty < 1){
    //       this.notificationHandler('Warning', 'Minimum Quantity should be One.', 'warning');
    //       return;
    //     }
    //   //console.log('values '+productCode+' && '+productQty);

    //   //console.log('localStorage '+JSON.stringify(localStorage.getItem('LSKey[c]products')));

    //     let products 	    = localStorage.getItem('LSKey[c]products');


    //     // check
    //     if(products == null){

    //         let productsArray = [];



    //         let productObj              = {};
    //         productObj.code             = productCode;
    //         productObj.qty              = productQty;
    //         productObj.name             = productTitle;
    //         productObj.price            = productPrice;
    //         productObj.proImg           = productImg;
    //         productObj.itemCode         = productItemCode;
    //         productObj.prodGST          = (productGST/100);
    //         productObj.proUom           = productUom;
    //         productObj.productGSTPrice  = this.handlePriceIncludingGST(productPrice,productGST);


    //         productsArray.push(productObj);
    //         localStorage.setItem('LSKey[c]products', JSON.stringify(productsArray));


    //       //console.log('localStorage '+JSON.stringify(localStorage.getItem('LSKey[c]products')));

    //         let response = true; //document.querySelector('#response');

    //         localStorage.setItem('LSKey[c]products', JSON.stringify(productsArray));

    //             if(response != null){
    //                 this.notificationHandler('Success', 'Product added successfully.', 'success');
    //             }

    //     }else{

    //         // if some in list
    //         //c

    //         let productsArray = JSON.parse(localStorage.getItem('LSKey[c]products'));
    //         let isExist       = productsArray.findIndex( pro => pro.code == productCode);

    //         if(isExist === -1){

    //             let productObj      = {};
    //             productObj.code     = productCode;
    //             productObj.qty      = productQty;
    //             productObj.name     = productTitle;
    //             productObj.price    = productPrice;
    //             productObj.proImg   = productImg;
    //             productObj.itemCode         = productItemCode;
    //             productObj.prodGST          = (productGST/100);
    //             productObj.proUom           = productUom;
    //             productObj.productGSTPrice  = this.handlePriceIncludingGST(productPrice,productGST);



    //             productsArray.push(productObj);
    //             localStorage.setItem('LSKey[c]products', JSON.stringify(productsArray));

    //             let response = true; //document.querySelector('#response');


    //             localStorage.setItem('LSKey[c]products', JSON.stringify(productsArray));

    //             if(response != null){

    //                 this.notificationHandler('Success', 'Product added successfully.', 'success');

    //             }
    //         }else{
    //             let response = true; //document.querySelector('#response');

    //             if(response != null){
    //                 this.notificationHandler('Warning', 'Product already exist in your cart.', 'warning');
    //             }

    //         }


    //     }
    // }


    // handlePriceIncludingGST(price,gstRate) {
    //     return  ((price/100)*(1*gstRate))
    // }



    // ===================== handle Navigation handler ===============================
    handleNavigation(event){

        let pageName = event.target.dataset.name;
        let pageType = event.target.dataset.type;
        let label    = event.target.label
        console.log('pageName '+pageName);


        if(label == 'Go Back'){
            if(this.toReturn!=null){
                pageName    = this.toReturn;
                if(this.toReturn == 'home'){
                    pageType = 'standard__namedPage';
                }else{
                    pageType = 'comm__namedPage';
                }
            }
        }

        console.log('pageName '+pageName);
        console.log('pageName '+pageType);
        console.log('this.toReturn '+this.toReturn);

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