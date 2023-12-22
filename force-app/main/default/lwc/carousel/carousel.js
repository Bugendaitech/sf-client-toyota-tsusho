import { LightningElement,track,wire } from 'lwc';
import getNewsdata from "@salesforce/apex/CarouselCtrl.getNewsdata";

export default class Carousel extends LightningElement {

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

    // @wire(getNewsdata)
    // wiregetNewsdata(wireResultMy) {
    //     const { data,error} = wireResultMy;
    //     ////// console.log('SJOn ');
    //     if (data) {
    //         let fullArray          = data;
    //         this.sliderArray       = fullArray; 
    //         this.numberOfSlides    = fullArray.length;

    //         //this.initiateCarousel();
    //     } else if (error) {
    //         this.error = error;
           
    //     }
    // }



    //initiateCarousel()

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
 
    }
  
    renderedCallback(){

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