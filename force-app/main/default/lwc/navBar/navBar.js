import { LightningElement,track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import IdOfLoggedInUser from '@salesforce/user/Id'; 


export default class NavBar extends NavigationMixin(LightningElement) {

    userId                      = IdOfLoggedInUser;
    @track _isLoggedIn = false;
 
 
    connectedCallback(){
        //JSON.parse(localStorage.getItem('LSKey[c]isLoggedIn'));  
        //let curVal         = JSON.parse(localStorage.getItem('LSKey[c]isLoggedIn')); 
        // console.log('this. '+this.userId);
        if(this.userId != null && this.userId !== '' && this.userId != undefined){
            this._isLoggedIn   = true;
        }
        
    }

 

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
}