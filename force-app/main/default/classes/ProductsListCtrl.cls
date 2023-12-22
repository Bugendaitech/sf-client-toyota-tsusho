public without sharing class ProductsListCtrl {
    public ProductsListCtrl() {
        
    }
    @AuraEnabled(cacheable=true)
    
    public static string showProducts(){

        List<wrapProduct> wrapperList = new List<wrapProduct>();

        List<PricebookEntry> ProductList = [SELECT Product2Id, UnitPrice,Product2.Name, Product2.Family,Product2.Quantity__c,Product2.Description,Product2.Short_Description__c,Product2.Product_Image__c From PricebookEntry WHERE Pricebook2Id = '01s9I0000003OPBQA2'];

        if(!ProductList.isEmpty()){
            for(PricebookEntry proObj: ProductList){
                //System.debug('inside');
                if(proObj.Product2.Product_Image__c != null){
                    wrapProduct wrapOj = new wrapProduct(
                        proObj.Product2Id,
                        proObj.Product2.Name,
                        proObj.UnitPrice,
                        proObj.Product2.Quantity__c,
                        proObj.Product2.Family,
                        proObj.Product2.Description,
                        proObj.Product2.Short_Description__c,
                        proObj.Product2.Product_Image__c
                    );
                    
                    wrapperList.add(wrapOj);
                }
            }
        }
        System.debug('Wrapper data::'+wrapperList);
        return JSON.serialize(wrapperList);

    }


    @AuraEnabled(cacheable = true)
    public static string getProductDetails(String productId){
        try {
            
            PricebookEntry productData = [SELECT Product2Id, UnitPrice,Product2.Name, Product2.Family,Product2.Quantity__c,Product2.Description,Product2.Short_Description__c,Product2.Product_Image__c From PricebookEntry WHERE Product2Id =: productId LIMIT 1];

            if(productData != null){
                  
                wrapProduct wrapOj = new wrapProduct(
                                        productData.Product2Id,
                                        productData.Product2.Name,
                                        productData.UnitPrice,
                                        productData.Product2.Quantity__c,
                                        productData.Product2.Family,
                                        productData.Product2.Short_Description__c,
                                        productData.Product2.Description,
                                        productData.Product2.Product_Image__c
                                    );
                return JSON.serialize(wrapOj); 
            }else{
                return null;
            }            

        } catch (Exception e) {
            // throw new AuraHandledException(e.getMessage());
            system.debug('error '+JSON.serialize(e.getMessage()));
            return JSON.serialize(e.getMessage()); 
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getPicklistValues(String objectName, String fieldName) {
        List<Map<String, String>> picklistValues = new List<Map<String, String>>();
        
        Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectName);
        Schema.DescribeSObjectResult objectDescribe = sObjectType.getDescribe();
        Map<String, Schema.SObjectField> fieldsMap = objectDescribe.fields.getMap();
        
        if (fieldsMap.containsKey(fieldName)) {
            Schema.DescribeFieldResult fieldResult = fieldsMap.get(fieldName).getDescribe();
            List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();
            
            for (Schema.PicklistEntry picklistEntry : picklistEntries) {
                if(picklistEntry.getLabel() != 'None'){
                    Map<String, String> entryMap = new Map<String, String>();
                    entryMap.put('label', picklistEntry.getLabel());
                    entryMap.put('value', picklistEntry.getValue());
                    picklistValues.add(entryMap);
                }
                
            }
        }
        
        return picklistValues;
    }


    public class wrapProduct{

        @AuraEnabled   
        public String name;
        @AuraEnabled   
        public Id id;
        @AuraEnabled   
        public String family;
        @AuraEnabled   
        public Decimal quantity;
        @AuraEnabled   
        public Decimal unitPrice;
        @AuraEnabled   
        public String shortDesc;
        @AuraEnabled   
        public String fullDesc;
        @AuraEnabled   
        public String imgSrc;
       
        public wrapProduct( Id id, String name, Decimal unitPrice,Decimal quantity, String family,String shortDesc,String fullDesc,String imgSrc){
            this.id           = id;
            this.name         = name;
            this.unitPrice    = unitPrice;
            this.quantity     = quantity;
            this.family       = family;
            this.shortDesc    = shortDesc;
            this.fullDesc     = fullDesc;
            if(imgSrc == '' || imgSrc == null){
                this.imgSrc   = null;
            }else{
                this.imgSrc   = imgSrc;
            }
        }
    }
}