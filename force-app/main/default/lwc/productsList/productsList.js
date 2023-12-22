import { LightningElement, track, wire } from 'lwc';
import showProducts from '@salesforce/apex/ProductsListCtrl.showProducts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProductsList extends LightningElement {
    @track records = [];
	@track isModalOpen = false;
    @track isChecked = true;
    @track productPrice;
	@track productName;

    
    

	// Months =[
	// 	{ label: '01', value: '01' },
	// 	{ label: '02', value: '02' },
	// 	{ label: '03', value: '03' },
	// 	{ label: '04', value: '04' },
	// 	{ label: '05', value: '05' },
	// 	{ label: '06', value: '06' },
	// 	{ label: '07', value: '07' },
	// 	{ label: '08', value: '08' },
	// 	{ label: '09', value: '09' },
	// 	{ label: '10', value: '10' },
	// 	{ label: '11', value: '11' },
	// 	{ label: '12', value: '12' }
	// ]

    _wiredMyData;

    @wire(showProducts)

    wireAccountData(wireResultMy) {

        const { data, error } = wireResultMy;

        this._wiredMyData = wireResultMy;

        if (data) {
            console.log(data, 'asdasd');
            if (data.length > 0) {
                this.records = JSON.parse(data);
                console.log(this.records, 'asdasdasdasdasd');
            } else if (data.length == 0) {
                // console.log('here 1');
                this.records = [];
            }
        } else if (error) {
            this.error = error;
        }

    }
}