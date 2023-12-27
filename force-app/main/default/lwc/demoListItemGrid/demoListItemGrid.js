import { LightningElement,api } from 'lwc';

export default class DemoListItemGrid extends LightningElement {

    @api showCount    = false;
    @api listItems    = [];
    @api title        = '';



    connectedCallback(){
        console.log('in connected DemoModelGrid ');
        console.log('in connected DemoModelGrid '+JSON.stringify(this.listItems));
        console.log('in connected DemoModelGrid size '+this.listItems.length);
        console.log('in connected DemoModelGrid showCount '+this.showCount);
        console.log('in connected DemoModelGrid title '+this.title);
    }



    handleClick(event){

        let item        = event.target.dataset.item;
        let key         = event.target.dataset.key;
        console.log('data item '+item+' key '+key);

        const   obj     = {
                            item : item,
                            key  : key
                          };
        event.stopPropagation();
        this.sendValuesToParent(obj);
    }



    sendValuesToParent(obj){

        console.log('obj '+JSON.stringify(obj));

        const oEvent = new CustomEvent('customclick', {
            'detail': obj
        });
        this.dispatchEvent(oEvent);
    }


}