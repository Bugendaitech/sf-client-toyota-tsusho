import getPicklistValuesbyApex from '@salesforce/apex/ProductsListCtrl.getPicklistValues';
import showProducts from '@salesforce/apex/ProductsListCtrl.showProducts';
// import PRO_FAMILY from "@salesforce/schema/Product2.Family";
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { LightningElement, track, wire } from 'lwc';


export default class ShowProductList extends NavigationMixin(LightningElement) {
    
    @track spinnerStatus        = false;
    @track bufferData = [];
	@track records    = [];
	@track proFamiles = [];
    @track catList    = [];
	@track isModalOpen = false;
    @track isChecked = true;
    @track productPrice;
	@track productName;

    get editPaymentClassJob(){
        return this.isModalOpen
        ? "slds-modal slds-modal_small slds-fade-in-open slds-scrollable_y"
        : "slds-modal";
      }
    
    get editPaymentBackdropClassJobDetails() {
        return this.isModalOpen
          ? "slds-backdrop slds-p-around_medium slds-modal_small slds-backdrop_open"
          : "slds-backdrop";
    }

    // @wire(getPicklistValues, {
    //     recordTypeId: "012000000000000AAA",
    //     fieldApiName: PRO_FAMILY
    //   })
    //   wiredPicklistValues({ data, error }) {
    //     if (data) {
    //         console.error('Picklist Data : '+data);
    //         console.error('Picklist Data 2 : '+ JSON.stringify(data));
    //         this.proFamiles = [];
    //         this.catList    = [];
    //         data.values.forEach(ele =>{
    //             //console.log('yes '+ele.value);
    //             this.catList = [...this.catList,ele.value];
    //         })
    //       this.proFamiles  = data.values;
    //       //console.log(JSON.stringify(this.proFamiles));
    //     //   //console.log(JSON.stringify(data.values));
    //     } else if (error) {
    //       console.error('Picklist Error : '+error);
    //     }
    //   }

    @wire(getPicklistValuesbyApex, { objectName: 'Product2', fieldName: 'Family' })
    wiredPicklistValues({ data, error }) {
        if (data) {
            console.error('Picklist Data Apex : ' + JSON.stringify(data));
            this.proFamiles = [];
            this.catList = [];
            console.error('Picklist Data Apex: ' + JSON.stringify(data));
            this.proFamiles = data;
            this.catList = data.map(entry => entry.value);
              
            // data.values.forEach(ele =>{
            //                 console.log('yes '+ele.value);
            //                 this.catList = [...this.catList,ele.value];
            //             })

            //          this.proFamiles  = data.value;
        } else if (error) {
            console.error('Picklist Error : ' + error);
        }
    }
 

    _wiredMyData;

    @wire(showProducts)
    wireProductList(wireResultMy) {

        const { data, error } = wireResultMy;
        this._wiredMyData     = wireResultMy;

        if (data) {
           console.log(data, 'asdasd');
            //console.log(data);
            if (data.length > 0) { 
                this.records     = [...JSON.parse(data)];
                this.bufferData  = [...JSON.parse(data)];
                this.spinnerStatus = true;
            } else if (data.length == 0) {
                this.records = [];
                this.spinnerStatus = true;
            }
        } else if (error) {
            console.log('Error :' +JSON.stringify(error));
            this.error = error;
            this.spinnerStatus = true;
        }

    }
 
	refreshValues() {
        //firstName
        this.template.querySelector(".first-name").value = '' ;
        this.template.querySelector(".mid-name").value = '' ;
        this.template.querySelector(".last-name").value = '' ;
        // this.template.querySelector(".bill-address").value = '' ;
        // this.template.querySelector(".ship-address").value = '';
        return;       
    }

	handleSelect(event) {
		this.isModalOpen = true;
        this.productPrice = event.currentTarget.dataset.price;
		this.productName = event.currentTarget.dataset.name;
	}

	closeModal() {
        // to close modal set isModalOpen tarck value as false
        // this.isModalOpen = false;
        // this.refreshValues();        
        this.isModalOpen = false;
		this.refreshValues();
		this.handleReset();
        // this.isModalOpen = false
    }

	handlePayment(){
		this.notificationHandler('Success', 'Payment Done Successfully.', 'success');
		this.isModalOpen = false;
		this.refreshValues();
		this.handleReset();

	}
	handleCheck(event) {
        this.isChecked = !event.target.checked;
    }




    //==================================== cart options=========================

    addToCart(event) {

        //console.log('called add to cart');

        let productCode       = event.target.dataset.proCode; 

        let selectedProduct   = this.records.filter(function (el) {
                                    return el.id == productCode;
                                });
    
        //console.log('selectedProduct '+JSON.stringify(selectedProduct));
                                
        let productQty        = 1;
        let productTitle      = selectedProduct[0].name;
        let productPrice      = selectedProduct[0].unitPrice;
        let productImg        = selectedProduct[0].imgSrc;

        //console.log('values '+productCode+' && '+productQty);

        //console.log('localStorage '+JSON.stringify(localStorage.getItem('LSKey[c]products')));

        let products 	    = localStorage.getItem('LSKey[c]products');


        // check 
        if(products == null){
            
            let productsArray = [];
                
            

            let productObj     = {};
            productObj.code    = productCode;
            productObj.qty     = productQty;
            productObj.name    = productTitle;
            productObj.price   = productPrice;
            productObj.proImg  = productImg;

            productsArray.push(productObj);
            localStorage.setItem('LSKey[c]products', JSON.stringify(productsArray));
            
            
            //console.log('localStorage '+JSON.stringify(localStorage.getItem('LSKey[c]products')));

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
                productObj.price    = productPrice;
                productObj.proImg   = productImg;

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

    // ===========================================================================


    // ===================== handle Navigation handler ===============================
    handleNavigation(event){

        let pageName = event.target.dataset.name;
        let pageType = event.target.dataset.type;
        let proId    = null;
        let toReturn = null;

        if(event.target.dataset.id != null && event.target.dataset.id != undefined){
            proId    = event.target.dataset.id;
            toReturn = 'home';
        } 

        proId    = btoa(proId); 

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