import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class CusLogout extends NavigationMixin(LightningElement) {


    connectedCallback(){
        //console.log('called logout');
        localStorage.clear();

        let pageName = 'home';
        let pageType = 'standard__namedPage';

        this[NavigationMixin.Navigate]({
            type: pageType,
            attributes: {
                pageName: pageName,
            } 
        });
    }

 

}