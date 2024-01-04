import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import { MessageContext, subscribe, unsubscribe } from 'lightning/messageService';
import msgService from '@salesforce/messageChannel/messageChannelForSlider__c';

// import getAllProducts from '@salesforce/apex/globalSearch.getAllProducts';
import getFilteredProduct from '@salesforce/apex/globalSearch.getFilteredProduct';
import getProductsFromStock from '@salesforce/apex/StockProducts_Ctrl.getProductsFromStock';

import getNewsdata from "@salesforce/apex/CarouselCtrl.getNewsdata";


export default class GlobalSearch extends NavigationMixin(LightningElement) {

    @wire(MessageContext)
    messageContext

    globalSearchLayout;


    @track needToShowFull       = true;
    @track isProductListVisible = false;
    @track productData          = [];
    @track productDataBuffer    = [];
    @track searchKey;

    @track slider           = null;
    @track nextBtn          = null;
    @track prevBtn          = null;
    @track slides           = null;
    @track slideIcons       = null;
    @track numberOfSlides   = 0;
    @track slideNumber      = 0;
    @track renderLoaded     = true;

    @track sliderArray      = [];

    @track playSlider;
    intervalId;

    connectedCallback() {
        // console.log('inside');

        // Start the interval when the component is connected
        this.intervalId = setInterval(() => {
            // Your code here
            // console.log('inside 1');

                if(this.slider != null || this.slider != undefined){
                    this.slides.forEach((slide) => {
                        slide.classList.remove("active");
                    });
                    // console.log('repeater 2');
                    this.slideIcons.forEach((slideIcon) => {
                            slideIcon.classList.remove("active");
                    });
                    // console.log('repeater 3');
                    this.slideNumber++;
                    // console.log('repeater 4');

                    if(this.slideNumber > (this.numberOfSlides - 1)){
                        this.slideNumber = 0;
                    }

                    // console.log('repeater 5');

                    this.slides[this.slideNumber].classList.add("active");
                    this.slideIcons[this.slideNumber].classList.add("active");
                    // console.log('repeater 6');
                }


        }, 5000); // Run every 1 second (1000ms)


        this.subscription = subscribe(this.messageContext, msgService, (message) => {
            this.sliderHandler(message);
            console.log('Message Items : '+JSON.stringify(message)); // Add this line to log the message to the console
        });

    }


    sliderHandler(message){
        console.log('In sliderHandler Handler '+this.globalSearchLayout);

        if(message.globalSearchLayout == false ||  this.globalSearchLayout == undefined ){
            this.needToShowFull    = false;
        }else{
            this.needToShowFull    = true;

        }
        console.log('Item sliderHandler callback : '+this.needToShowFull);
    }


    renderedCallback() {
        if (this.isProductListVisible) {
            // Adding event listener after rendering dropdown
            window.addEventListener('click', this.handleClickOutside);
        } else {
            // Removing event listener if dropdown is not visible
            window.removeEventListener('click', this.handleClickOutside);
        }

        getNewsdata()
        .then((data)=>{
            // console.log(data, 'inside then');
            let fullArray          = data;
            this.sliderArray       = fullArray;
            this.numberOfSlides    = fullArray.length;
            // console.log(fullArray, 'inside then');

        })
        .catch((error)=>{

        })
        .finally(()=>{
            if(this.renderLoaded){

                this.slider           = this.template.querySelector(".slider");
                this.nextBtn          = this.template.querySelector(".next-btn");
                this.prevBtn          = this.template.querySelector(".prev-btn");
                this.slides           = this.template.querySelectorAll(".slide");
                this.slideIcons       = this.template.querySelectorAll(".slide-icon");
                this.numberOfSlides   = this.slides.length;

                // console.log('this.slider '+JSON.stringify(this.slider));

                // foractivate 1 slide and icon
                // this.slides[0].classList.add("active");
                // this.slideIcons[0].classList.add("active");

                //image slider next button
                this.nextBtn.addEventListener("click", () => {
                    //// console.log('slide clicked');
                    this.slides.forEach((slide) => {
                        //// console.log('slide cliced '+slide.classList);
                        slide.classList.remove("active");
                    });
                    this.slideIcons.forEach((slideIcon) => {
                        slideIcon.classList.remove("active");
                    });

                    this.slideNumber++;

                    if(this.slideNumber > (this.numberOfSlides - 1)){
                        this.slideNumber = 0;
                    }

                    this.slides[this.slideNumber].classList.add("active");
                    this.slideIcons[this.slideNumber].classList.add("active");
                });


                //image slider previous button
                this.prevBtn.addEventListener("click", () => {
                    //// console.log('slide clicked');
                    this.slides.forEach((slide) => {
                        slide.classList.remove("active");
                    });
                        this.slideIcons.forEach((slideIcon) => {
                        slideIcon.classList.remove("active");
                    });

                    this.slideNumber--;

                    if(this.slideNumber < 0){
                        this.slideNumber = this.numberOfSlides - 1;
                    }

                    this.slides[this.slideNumber].classList.add("active");
                    this.slideIcons[this.slideNumber].classList.add("active");
                });

                //// console.log('playSlider before');

                //image slider autoplay
                var playSlider;
                var playSlider2;


                //// console.log('playSlider after');
                //stop the image slider autoplay on mouseover
                this.slider.addEventListener("mouseover", () => {
                    //// console.log('mouseover bef');
                    clearInterval(playSlider);
                    clearInterval(playSlider2);
                    clearInterval(this.intervalId)
                    //// console.log('mouseover aft');
                });

                //start the image slider autoplay again on mouseout
                this.slider.addEventListener("mouseout", () => {
                    //// console.log('mouseout bef');
                    this.repeater();
                        playSlider2 = setInterval(function(){
                            //// console.log('inside mouseout bef');
                            //// console.log('inside mouseout bef' +JSON.stringify(this.slides));
                            this.slides.forEach((slide) => {
                                slide.classList.remove("active");
                            });
                            //// console.log('repeater 2');
                            this.slideIcons.forEach((slideIcon) => {
                                    slideIcon.classList.remove("active");
                            });
                            //// console.log('repeater 3');
                            this.slideNumber++;
                            //// console.log('repeater 4');

                            if(this.slideNumber > (this.numberOfSlides - 1)){
                                this.slideNumber = 0;
                            }

                            //// console.log('repeater 5');

                            this.slides[this.slideNumber].classList.add("active");
                            this.slideIcons[this.slideNumber].classList.add("active");
                            //// console.log('repeater 6');
                        }, 4000);
                    //clearInterval(playSlider);
                    //// console.log('mouseout aft');
                });
                //// console.log('mouseout 1');

                this.renderLoaded = false;
           }
        })

    }

    _wiredMyData;
    @wire(getProductsFromStock)
    wireAccountData(wireResultMy) {

        const { data, error }   = wireResultMy;
        this._wiredMyData       = wireResultMy;

        console.log('data from getProductsFromStock', data);

        if (data) {

            let res  = JSON.parse(data);

            if (!res.error) {

                this.productData   = res.data;
                this.productDataBuffer = res.data;
                // this.productData = JSON.parse(JSON.stringify(this.productData).slice(0, 5));

                // this._buf_totalProducts = res.totalProducts;
                // this._haveError         = false;
                // this.setProductForChild(this._buf_productList);
                // this.isLoaded           = true;
                console.log('in data');

            } else {

                this.productData   = [];
                // this._buf_totalProducts = 0;
                // this._haveError         = true;
                // this._errorMsg          = res.msg;
                // this.isLoaded           = true;
                console.log('in error');

            }
            this.spinnerStatus = true;
        } else if (error) {

            this.error          = error;
            this.spinnerStatus  = true;
        }

    }


    // showProductList(event) {
    //     this.isProductListVisible = true;
    //     event.stopPropagation();
    // }

    handleProductSearch(event) {

        if(event.currentTarget.dataset.id == null || event.currentTarget.dataset.id == undefined){
            return;
        }

        let proId   = event.currentTarget.dataset.id;
        let proName = event.currentTarget.dataset.name;

        console.log('Prod Id : '+proId);
        console.log('Navigate Page : '+event.currentTarget.dataset.label);


        let pageName = event.currentTarget.dataset.label;
        let pageType = event.currentTarget.dataset.type;

        proId        = btoa(proId);

        let breadcurmbsItemsLocal = [];
        let toReturn = null;

        let breadCurmbObj        =  {
            label    : proName,
            name     : proName,
            type     : 'self',
            isActive : true
        };

        breadcurmbsItemsLocal.push(breadCurmbObj);
        toReturn = btoa(JSON.stringify(breadcurmbsItemsLocal));

        if(proId != undefined || proId != null){
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

    handleClickOutside = (event) => {
        // Checking if click is inside the component
        if (this.isProductListVisible && !this.template.contains(event.target)) {
            this.isProductListVisible = false;
        }
    }

    handleOnChange(event) {

        if (event.key === "Enter") {
            this.getFilteredData();
            this.isProductListVisible = true;
        }
        this.searchKey = event.target.value;

    }

    handleSearch(event) {
        this.isProductListVisible = true;
        event.stopPropagation();
        this.getFilteredData();
    }

    getFilteredData(event) {
        console.log('Search Key : '+this.searchKey);
        let key = this.searchKey;
        console.log('Search Key Length : '+key.length);
        this.spinnerStatus = false;


        if(key.length >= 3){
            getFilteredProduct({ prodName: this.searchKey })
                .then(res => {
                    console.log('Filtered Data: ' + JSON.stringify(res));
                    if (res) {
                        let result = JSON.parse(res);
                        if (!result.error) {
                            this.productData = result.data;
                            console.log('in data : '+JSON.stringify(result.data));
                        } else {
                            this.productData = [...this.productDataBuffer];
                            console.log('in error');
                        }
                    }
                })
                .catch(error => {
                    this.productData = [...this.productDataBuffer];
                    this.productData = JSON.parse(JSON.stringify(this.productData).slice(0, 5));
                    this.error = error;
                })
                .finally(() => {
                    this.spinnerStatus = true;
                });
        } else {
            this.productData = [...this.productDataBuffer];
            this.spinnerStatus = true;
        }
    }

    handleNavigate(){
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: 'Shop',
            }
        });
    }

    repeater(){
        //// console.log('repeater 1');


        playSlider = setInterval(function(){

            this.slides.forEach((slide) => {
                slide.classList.remove("active");
            });
            //// console.log('repeater 2');
            this.slideIcons.forEach((slideIcon) => {
                    slideIcon.classList.remove("active");
            });
            //// console.log('repeater 3');
            this.slideNumber++;
            //// console.log('repeater 4');

            if(this.slideNumber > (this.numberOfSlides - 1)){
                this.slideNumber = 0;
            }

            //// console.log('repeater 5');

            this.slides[this.slideNumber].classList.add("active");
            this.slideIcons[this.slideNumber].classList.add("active");
            //// console.log('repeater 6');
        }, 4000);
    }



}