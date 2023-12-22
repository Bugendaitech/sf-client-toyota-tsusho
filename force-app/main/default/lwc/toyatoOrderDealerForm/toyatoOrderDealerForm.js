import { LightningElement } from 'lwc';

export default class ToyatoOrderDealerForm extends LightningElement {

    orderType = [
        { label: 'Regular', value: 'Regular' },
        { label: 'Warranty Replacement', value: 'Warranty Replacement' }
    ];
}