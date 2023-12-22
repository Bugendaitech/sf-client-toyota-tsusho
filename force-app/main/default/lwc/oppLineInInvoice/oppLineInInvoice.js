import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { getListUi } from 'lightning/uiListApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import OPPORTUNITY_LINE_ITEM_OBJECT from '@salesforce/schema/OpportunityLineItem';
import OPPORTUNITY_LINE_ITEM_NAME from '@salesforce/schema/OpportunityLineItem.Name';
import OPPORTUNITY_LINE_ITEM_QUANTITY from '@salesforce/schema/OpportunityLineItem.Quantity';
import OPPORTUNITY_LINE_ITEM_UNIT_PRICE from '@salesforce/schema/OpportunityLineItem.UnitPrice';
import OPPORTUNITY_LINE_ITEM_TOTAL_PRICE from '@salesforce/schema/OpportunityLineItem.TotalPrice';

const OPPORTUNITY_LINE_ITEM_FIELDS = [OPPORTUNITY_LINE_ITEM_NAME, OPPORTUNITY_LINE_ITEM_QUANTITY, OPPORTUNITY_LINE_ITEM_UNIT_PRICE, OPPORTUNITY_LINE_ITEM_TOTAL_PRICE];

const COLUMNS = [
    { label: 'Product', fieldName: 'Name' },
    { label: 'Quantity', fieldName: 'Quantity', type: 'number' },
    { label: 'Price', fieldName: 'UnitPrice', type: 'currency' },
    { label: 'Total Price', fieldName: 'TotalPrice', type: 'currency' }
];

export default class OpportunityLineItems extends LightningElement {
    @api recordId;
    oppLineItems;
    error;

    @wire(getRecord, { recordId: '$recordId', fields: 'Opportunity.Name' })
    opportunity;

    @wire(getListUi, { 
        objectApiName: OPPORTUNITY_LINE_ITEM_OBJECT.objectApiName, 
        fields: OPPORTUNITY_LINE_ITEM_FIELDS, 
        filters: [{ fieldApiName: 'OpportunityId', operator: '=', value: '$recordId' }], 
        pageSize: 10 
    })
    wiredOppLineItems({ error, data }) {
        if (data) {
            this.oppLineItems = data.records.records;
        } else if (error) {
            this.error = error;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading Opportunity Line Items',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        }
    }

    get columns() {
        return COLUMNS;
    }

    get oppName() {
        return this.opportunity.data ? this.opportunity.data.fields.Name.value : '';
    }
}