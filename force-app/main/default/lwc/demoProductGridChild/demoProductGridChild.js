import { LightningElement, track, api } from 'lwc';

export default class DemoProductGridChild extends LightningElement {

    @api productItems = [];

    connectedCallback(){
        console.log('DemoProductGridChild');
        console.log('productList '+JSON.stringify(this.productItems));
    }

}