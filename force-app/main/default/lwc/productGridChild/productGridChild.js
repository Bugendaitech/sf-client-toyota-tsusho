import { LightningElement, api } from 'lwc';

import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProductGridChild extends NavigationMixin(LightningElement) {

    @api productItems;


    connectedCallback(){
        console.log('called ProductGridChild');
        console.log('data ProductGridChild '+JSON.stringify(this.productItems));
    }

    addToCart(event) {

        console.log('called add to cart');

        let productCode       = event.target.dataset.proCode;

        let selectedProduct   = this.productItems.filter(function (el) {
                                    return el.Product2Id == productCode;
                                });

        console.log('selectedProduct '+JSON.stringify(selectedProduct));

        let productQty        = 1;
        let productTitle      = selectedProduct[0].Product2.Description;
        let productUom        = selectedProduct[0].Product2.UOM__c;
        let productItemCode   = selectedProduct[0].Product2.Name;
        let productPrice      = selectedProduct[0].UnitPrice;
        let productImg        = selectedProduct[0].Product2.Product_Image__c;
        let productGST        = selectedProduct[0].Product2.GST__c;

        console.log('values '+productCode+' && '+productQty);


        let products 	    = localStorage.getItem('LSKey[c]products');


        // check
        if(products == null){

            let productsArray = [];



            let productObj              = {};
            productObj.code             = productCode;
            productObj.qty              = productQty;
            productObj.name             = productTitle;
            productObj.itemCode         = productItemCode;
            productObj.price            = productPrice;
            productObj.proImg           = productImg;
            productObj.prodGST          = (productGST/100);
            productObj.proUom           = productUom;
            productObj.productGSTPrice  = this.handlePriceIncludingGST(productPrice,productGST);

            productsArray.push(productObj);
            localStorage.setItem('LSKey[c]products', JSON.stringify(productsArray));


            console.log('localStorage '+JSON.stringify(localStorage.getItem('LSKey[c]products')));

            let response = true; //document.querySelector('#response');

            localStorage.setItem('LSKey[c]products', JSON.stringify(productsArray));

                if(response != null){
                    this.notificationHandler('Success', 'Product added successfully.', 'success');
                    this.countProduct();
                    this.cartTotalAmount();
                    this.totalTax();
                }



        }else{

            // if some in list
            //c

            let productsArray = JSON.parse(localStorage.getItem('LSKey[c]products'));
            let isExist       = productsArray.findIndex( pro => pro.code == productCode);

            if(isExist === -1){

                let productObj      = {};
                productObj.code     = productCode;
                productObj.qty      = productQty;
                productObj.name     = productTitle;
                productObj.itemCode         = productItemCode;
                productObj.price    = productPrice;
                productObj.proUom           = productUom;
                productObj.proImg   = productImg;
                productObj.prodGST  = (productGST/100);
                productObj.productGSTPrice = this.handlePriceIncludingGST(productPrice,productGST);

                productsArray.push(productObj);
                localStorage.setItem('LSKey[c]products', JSON.stringify(productsArray));

                let response = true; //document.querySelector('#response');


                localStorage.setItem('LSKey[c]products', JSON.stringify(productsArray));

                if(response != null){

                    this.notificationHandler('Success', 'Product added successfully.', 'success');
                    this.countProduct();
                    this.cartTotalAmount();
                    this.totalTax();

                }

            }else{
                let response = true; //document.querySelector('#response');

                if(response != null){
                    this.notificationHandler('Warning', 'Product already exist in your cart.', 'warning');
                }

            }


        }


        console.log('localStorage '+JSON.stringify(localStorage.getItem('LSKey[c]products')));
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


    cleanCart(){
        localStorage.clear();
    }


    handleCategory(event){


        this.spinnerStatus = false;
        let title          = event.target.dataset.title;
        let ind            = this.catList.indexOf(title);

        this.records = [];


        let listOfCategory  = this.template.querySelectorAll('.custom-badge');

        if(ind == -1){

            listOfCategory.forEach((ele, i, orgArray) =>{
                if(i==0){
                    orgArray[i].classList.add('custom-badge-active'); // = "utility:chevrondown";
                }else{
                    orgArray[i].classList.remove('custom-badge-active'); // = "utility:chevrondown";
                }
            })

            this.records = [...this.bufferData];
            this.spinnerStatus = true;
        }else{
            listOfCategory.forEach((ele, i, orgArray) =>{
                // //console.log('ele '+ind);
                if(ind+1 == i){
                    orgArray[i].classList.add('custom-badge-active'); // = "utility:chevrondown";
                }else{
                    orgArray[i].classList.remove('custom-badge-active'); // = "utility:chevrondown";
                }

            })

            let filterData = [...this.bufferData];

          //console.log('filterData '+JSON.stringify(filterData));

            let afterFilter = filterData.filter(function (el) {
                return el.family == title;
            });


          //console.log('filterData '+JSON.stringify(afterFilter));
            this.records = [...afterFilter];
            this.spinnerStatus = true;
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

    handlePriceIncludingGST(price,gstRate) {
        return  ((price/100)*(1*gstRate))
    }

}