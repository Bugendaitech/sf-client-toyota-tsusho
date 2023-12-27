import { LightningElement,api } from 'lwc';

export default class DemoModelGrid extends LightningElement {


    @api listItems = [];


    connectedCallback(){
        console.log('in connected DemoModelGrid ');
        console.log('in connected DemoModelGrid '+JSON.stringify(this.listItems));
        console.log('in connected DemoModelGrid size '+this.listItems.length);
    }
}