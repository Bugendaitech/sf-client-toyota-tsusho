global with sharing class csvHandlerForDataImport implements Messaging.InboundEmailHandler {
    // public csvHandlerForDataImport() {

    // }

    private static final String CSV_FILE_EXTENSION = '.csv';
    
    private String senderEmail;
    private Messaging.InboundEmailResult result;
    private List<Map<String, String>> data = new List<Map<String, String>>();

    global Messaging.InboundEmailResult handleInboundEmail(Messaging.InboundEmail ie, Messaging.InboundEnvelope env) {
        system.debug('email details '+ie);
        this.senderEmail = ie.fromAddress;
        this.result = new Messaging.InboundEmailResult();
        List<Messaging.InboundEmail.TextAttachment> attachments = new List<Messaging.InboundEmail.TextAttachment>();
        system.debug('@@attachments '+ie.binaryAttachments);
        attachments.addAll(ie.textAttachments);
        System.debug('Handling email with--->> ' + attachments.size() + ' attachments.');
        for (Messaging.InboundEmail.TextAttachment attachment : attachments) {
            system.debug('filename '+attachment);
            if (attachment.fileName.endsWith(CSV_FILE_EXTENSION)) {
                processAttachment(attachment.body);
            }
        }
        return this.result;
    }
    private void processAttachment(String attachmentBody) {
        system.debug('inside processAttac');
        this.data = CsvReader.read(attachmentBody);
        system.debug('data size:: '+data.size());
        try {
            this.importDealers();
            this.result.success = true;
        } catch (Exception e) {
            this.result.success = false;
            System.debug(e.getMessage());
            System.debug(e.getStackTraceString());
        }
    }
    private  void importDealers(){
        List<Account> accountListtoImport = new List<Account>();
        for (Map<String, String> row : data) {
            Account accRecord = new Account();
            if(row.get('Customer code') != ''){
                system.debug('Customer code '+row.get('Customer code'));
                accRecord.Customer_ID__c = row.get('Customer code');
            }
            if(row.get('Customer Name') != ''){
                system.debug('Customer Name '+row.get('Customer Name'));
                accRecord.Name = row.get('Customer Name');
            }
            String streetAddress = '';
            if(row.get('Address 1') != ''){
                system.debug('Address 1 '+row.get('Address 1'));
                streetAddress += row.get('Address 1')+'\n';
            }
            if(row.get('Address 2') != ''){
                system.debug('Address 2 '+row.get('Address 2'));
                streetAddress += row.get('Address 2');
            }
            accRecord.BillingStreet = streetAddress != '' ? streetAddress : '';

            if(row.get('City') != ''){
                system.debug('City '+row.get('City'));
                accRecord.BillingCity = row.get('City');
            }
            if(row.get('State ID') != ''){
                system.debug('State ID '+row.get('State ID'));
                accRecord.BillingState = row.get('State ID');
            }
            if(row.get('ISO country code') != ''){
                system.debug('ISO country code '+row.get('ISO country code'));
                accRecord.BillingCountry = row.get('ISO country code');
            }
            if(row.get('Zip code') != ''){
                system.debug('Zip code '+row.get('Zip code'));
                accRecord.BillingPostalCode = row.get('Zip code');
            }
            if(row.get('Phone no') != ''){
                system.debug('Phone no '+row.get('Phone no'));
                accRecord.Phone = row.get('Phone no');
            }
            if(row.get('E mail') != ''){
                system.debug('E mail '+row.get('E mail'));
                accRecord.Person_Email__c = row.get('E mail');
            }
            if(row.get('Pan number') != ''){
                system.debug('Pan number '+row.get('Pan number'));
                accRecord.PAN_Number__c = row.get('Pan number');
            }
            accRecord.Imported_Via_Email__c = true;
            

            accountListtoImport.add(accRecord);
        }
        if(accountListtoImport.size() > 0){
            insert accountListtoImport;
        }
    }

}