import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CusLogin extends NavigationMixin(LightningElement) {


    @track  userName = '';
    @track  password = '';

    handleInputs(event){
        
        let label = event.target.label;
        let value = event.target.value;

        if(label == 'User Name'){
            this.userName  = value;
        }else if(label == 'Password'){
            this.password  = value;
        }
    }


    handleLogin(){

        if(this.userName.length > 4 && this.password.length > 4){
            localStorage.setItem('LSKey[c]isLoggedIn', true);

            let pageName = 'checkout';
            let pageType = 'comm__namedPage';

            this[NavigationMixin.Navigate]({
                type: pageType,
                attributes: {
                    pageName: pageName,
                } 
            });
        }else{
            this.notificationHandler('Error', 'Please all required fields.', 'error');
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

}