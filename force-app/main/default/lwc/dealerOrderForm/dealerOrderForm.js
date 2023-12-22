import { LightningElement, track, wire, api } from 'lwc';
import getOrderDetails from '@salesforce/apex/DealerOrderFormController.getOrderDetails';

export default class DealerOrderForm extends LightningElement {

    @track showButton = true;
    @track showForm = false;
     productData = [];
     error ;
     zoneData = [{Region: "South India", Mark:"", Days:"2 days"}, 
     {Region:"West India", Mark:"", Days:"5 days"}, 
     {Region: "North India", Mark:"",Days:"6 days"}, 
     {Region: "East India", Mark:"", Days:"8 days"}, 
     {Region:  "North East/ J&K region", Mark:"", Days:"11 days"}];
     

    @wire(getOrderDetails) 
    getOdrers({ error, data }) {
        if (data) {
            console.log(data);
            this.productData = data;
            //this.productData = JSON.stringify(data);
            this.error = undefined;
        console.log('Orders == '+ this.productData);
        } else if (error) {
            this.error = error;
        }
    } 

    
    //console.log('testin');
     
    handleDealerOrderFormClick(event) {
        this.showButton = false;
        this.showForm = true;
        // Handle the click event for the "Warranty" button here
        // You can add your logic to navigate to a specific URL or perform other actions
        //alert('DealerOrderForm button clicked!');
    }
}