/**
 * @description       :
 * @author            : Anshul Kanaujia
 * @group             : BT Team
 * @last modified on  : 12-21-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public without sharing class StockProducts_Ctrl {


    @AuraEnabled(cacheable=true)
    public static String getProductsFromStock() {


            Map<String,Object> retMap   = new Map<String,Object>();

        try {

            User userDetails   			= GetLoggedInUserDetails_Ctrl.getUserDetails();

            // List<Stock__c> stockList    = [SELECT
            //                                 Id,
            //                                 Name,
            //                                 Product__c,
            //                                 Product__r.Name,
            //                                 Quantity__c,
            //                                 Locked_Quantity__c
            //                             FROM
            //                                 Stock__c
            //                             WHERE
            //                                 Warehouse__c = :userDetails.Contact.Warehouse__c
            //                             WITH
            //                                 USER_MODE];

            Set<Id> warehouseProducts = new Set<Id>();

            String warehouseId  = userDetails.WarehouseId__c; // 'a059I000002zjYtQAI'; //

            for (Stock__c stock :  [SELECT
                                        Product__c
                                    FROM
                                        Stock__c
                                    WHERE
                                        Warehouse__c = : warehouseId
                                    WITH
                                        USER_MODE]) {
                // Add each product ID to the Set
                warehouseProducts.add(stock.Product__c);
            }

            System.debug('WarehouseProducts  ' + warehouseProducts);
            List<PricebookEntry> pbeList  =  [SELECT Product2Id,Product2.Family,Product2.Name,Product2.West_Material_Code__c,Product2.Description,Product2.ProductCode,Product2.GST__c,Product2.UOM__c,UnitPrice,Product2.Product_Image__c FROM PricebookEntry WHERE Product2Id IN : warehouseProducts AND Pricebook2Id = '01s9I0000003OPBQA2' WITH
            USER_MODE];
            System.debug('pbeList  ' + pbeList);


            System.debug('Stock__c  ');
            System.debug('stockList '+ pbeList.size());
            System.debug('stockList size '+ pbeList);

			retMap.put('status','success');
            retMap.put('error',false);
            retMap.put('totalProducts',pbeList.size());
            retMap.put('data',pbeList);

        } catch (Exception e) {
            system.debug('error '+e.getMessage());
            //throw new AuraHandledException(e.getMessage());
            retMap.put('status','error');
            retMap.put('error',true);
            retMap.put('msg',e.getMessage());
            retMap.put('data',null);
        }

        return  JSON.serialize(retMap);
    }


    @AuraEnabled(cacheable = true)
    public static string getProductDetails(String productId){
        try {

            PricebookEntry productData = [SELECT Product2Id,Product2.Family,Product2.Name,Product2.Quantity__c,Product2.West_Material_Code__c,Product2.Description,Product2.ProductCode,Product2.GST__c,Product2.UOM__c,UnitPrice,Product2.Product_Image__c FROM PricebookEntry WHERE Product2Id =: productId  AND Pricebook2Id='01s9I0000003OPBQA2' LIMIT 1];

            if(productData != null){

                wrapProduct wrapOj = new wrapProduct(
                                        productData.Product2Id,
                                        productData.Product2.UOM__c,
                                        productData.Product2.ProductCode,
                                        productData.Product2.Name,
                                        productData.UnitPrice,
                                        productData.Product2.Quantity__c,
                                        productData.Product2.Family,
                                        productData.Product2.West_Material_Code__c,
                                        productData.Product2.Description,
                                        productData.Product2.GST__c,
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
        public String proCode;
        @AuraEnabled
        public String proUom;
        @AuraEnabled
        public Id id;
        @AuraEnabled
        public String family;
        @AuraEnabled
        public Decimal quantity;
        @AuraEnabled
        public Decimal unitPrice;
        @AuraEnabled
        public String westCode;
        @AuraEnabled
        public String fullDesc;
        @AuraEnabled
        public String imgSrc;
        @AuraEnabled
        public Decimal gst;

        public wrapProduct( Id id, String proUom,String proCode, String name, Decimal unitPrice,Decimal quantity, String family,String westCode,String fullDesc,Decimal gst,String imgSrc){
            this.id           = id;
            this.proUom      = proUom;
            this.proCode      = proCode;
            this.name         = name;
            this.unitPrice    = unitPrice;
            this.quantity     = quantity;
            this.family       = family;
            this.westCode     = westCode;
            this.fullDesc     = fullDesc;
            this.gst          = gst;
            if(imgSrc == '' || imgSrc == null){
                this.imgSrc   = null;
            }else{
                this.imgSrc   = imgSrc;
            }
        }
    }
}