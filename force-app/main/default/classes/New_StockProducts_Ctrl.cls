/**
 * @description       :
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             :
 * @last modified on  : 12-27-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class New_StockProducts_Ctrl {

    public static Id pricebookId        = AddToCart_Ctrl.getPricebookIdByName('Toyota_Price_Book');
    public static User userDetails      = GetLoggedInUserDetails_Ctrl.getUserDetails();

    @AuraEnabled
    public static String getProductsFromStock(String modalType, String familyType) {


            Map<String,Object> retMap                = new Map<String,Object>();
            List<StockProducts_Wrapper> stoksProList = new List<StockProducts_Wrapper>();

        try {




            String warehouseId          = 'a059I000002zjYtQAI'; //userDetails.WarehouseId__c; //


            Map<Id,Decimal>  mapOfStock = getProductsFromStock(warehouseId,modalType,familyType);

            List<PricebookEntry> pbeList    =  [SELECT
                                                    Product2Id,
                                                    Product2.Family,
                                                    Product2.Name,
                                                    Product2.West_Material_Code__c,
                                                    Product2.Description,
                                                    Product2.ProductCode,
                                                    // Product2.GST__c,
                                                    Product2.UOM__c,
                                                    Product2.Model__c,
                                                    UnitPrice,
                                                    Product2.Product_Image__c
                                                FROM
                                                    PricebookEntry
                                                WHERE
                                                    Product2Id IN : mapOfStock.keySet()
                                                AND
                                                    Pricebook2Id =: pricebookId
                                                WITH
                                                    USER_MODE];

            for(PricebookEntry priObj   :  pbeList){

                if(mapOfStock.containsKey(priObj.Product2Id)){
                    StockProducts_Wrapper stockPro  = new StockProducts_Wrapper(priObj,mapOfStock.get(priObj.Product2Id));
                    stoksProList.add(stockPro);
                }

            }


            System.debug('pbeList  ' + stoksProList);


            System.debug('Stock__c  ');
            System.debug('stockList '+ stoksProList.size());
            System.debug('stockList size '+ stoksProList);

			retMap.put('status','success');
            retMap.put('error',false);
            retMap.put('totalProducts',stoksProList.size());
            retMap.put('data',stoksProList);

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


    private static Map<Id,Decimal> getProductsFromStock(String warehouseId, String modalType ,String familyType){

        Set<Id> warehouseProducts   = new Set<Id>();
        Map<Id,Decimal>  mapOfStock = new Map<Id,Decimal>();
        for (Stock__c stock :   [SELECT
                                        Product__c,
                                        Quantity__c
                                    FROM
                                        Stock__c
                                    WHERE
                                        Warehouse__c = : warehouseId
                                    AND
                                        Product__r.Family =: familyType
                                    AND
                                        Product__r.Model__c =: modalType
                                    WITH
                                        USER_MODE]) {
                // Add each product ID to the Set
                warehouseProducts.add(stock.Product__c);
                mapOfStock.put(stock.Product__c,stock.Quantity__c);
            }
        System.debug('WarehouseProducts  ' + warehouseProducts);
        return mapOfStock;
    }

    @AuraEnabled(cacheable = true)
    public static string getProductDetails(String productId){
        try {

            PricebookEntry productData  =   [
                                                SELECT
                                                    Product2Id,
                                                    Product2.Family,
                                                    Product2.Name,
                                                    Product2.Quantity__c,
                                                    Product2.West_Material_Code__c,
                                                    Product2.Description,
                                                    Product2.ProductCode,
                                                    // Product2.GST__c,
                                                    Product2.UOM__c,
                                                    UnitPrice,
                                                    Product2.Product_Image__c
                                                FROM
                                                    PricebookEntry
                                                WHERE
                                                    Product2Id =: productId
                                                AND
                                                    Pricebook2Id=: pricebookId
                                                WITH
                                                    USER_MODE
                                                LIMIT 1
                                            ];


            if(productData != null){

                wrapProduct wrapOj = new wrapProduct(productData);
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

    // get related categoies accordig to the Modal
    @AuraEnabled
    public static String getRelatedCategories(String keyValue) {

        Map<String,Object>  retMap   = new Map<String,Object>();
            try {
                    List<Map<String, String>> retValues = new List<Map<String, String>>();

                    String warehouseId              = 'a059I000002zjYtQAI'; //userDetails.WarehouseId__c; //

                    List<AggregateResult>  agrList  =   [SELECT
                                                            Product__r.Family proFamily,
                                                            COUNT(Id) proCount
                                                        FROM
                                                            Stock__c
                                                        WHERE
                                                            Warehouse__c =: warehouseId
                                                        AND
                                                            Product__r.Model__c =: keyValue
                                                        WITH
                                                            USER_MODE
                                                        GROUP BY
                                                            Product__r.Family
                                                        ];
					System.debug('agrList '+agrList);
                    if(!agrList.isEmpty()){

                        for(AggregateResult agrObj    :  agrList){
                            //familyList.add(String.valueOf(agrObj.get(fieldName)));
                            Map<String, String> mapOfVal = new Map<String, String>();
                            mapOfVal.put('label', String.valueOf(agrObj.get('proFamily')));
                            mapOfVal.put('value', String.valueOf(agrObj.get('proFamily')));
                            mapOfVal.put('count', String.valueOf(agrObj.get('proCount')));
                            retValues.add(mapOfVal);
                        }

                        retMap.put('status','success');
                        retMap.put('data',retValues);
                        System.debug('family '+retValues);

                    }else{

                        retMap.put('status','error');
                        retMap.put('data',null);
                        retMap.put('msg','No Product Family Found with this Modal.');
                        retMap.put('label','Error !');
                    }
            } catch (Exception ex) {

                String errorMessage = 'Cause :' + ex.getCause() + '\n';
                errorMessage += 'Line Number :' + ex.getLineNumber() + '\n';
                errorMessage += 'Message :' + ex.getMessage() + '\n';
                errorMessage += 'Stack Trace :' + ex.getStackTraceString() + '\n';
                errorMessage += 'Type :' + ex.getTypeName() + '\n';

                retMap.put('status','error');
                retMap.put('label','Error !');
                retMap.put('msg',errorMessage);

                System.debug('Error '+errorMessage);
            }

            System.debug('return map '+retMap);
            return JSON.serialize(retMap);


    }



    public class StockProducts_Wrapper{

        @AuraEnabled
        public String proId;
        @AuraEnabled
        public String proName;
        @AuraEnabled
        public String proFamily;
        @AuraEnabled
        public String proModal;
        @AuraEnabled
        public String proCode;
        @AuraEnabled
        public String proWestCode;
        @AuraEnabled
        public String proDesc;
        @AuraEnabled
        public String proUom;
        @AuraEnabled
        public Decimal proGst;
        @AuraEnabled
        public Decimal proPrice;
        @AuraEnabled
        public String proImage;
        @AuraEnabled
        public Decimal inStock;

        public StockProducts_Wrapper(PricebookEntry priceBookObj, Decimal inStock){

            this.proId        = priceBookObj.Product2Id;
            this.proName      = priceBookObj.Product2.Name;
            this.proFamily    = priceBookObj.Product2.Family;
            this.proModal     = priceBookObj.Product2.Model__c;
            this.proCode      = priceBookObj.Product2.ProductCode;
            this.proWestCode  = priceBookObj.Product2.West_Material_Code__c;
            this.proDesc      = priceBookObj.Product2.Description;
            this.proUom       = priceBookObj.Product2.UOM__c;
            // this.proGst       = priceBookObj.Product2.GST__c;
            this.proPrice     = priceBookObj.UnitPrice;
            this.proImage     = priceBookObj.Product2.Product_Image__c;
            this.inStock      = inStock;

        }
    }


    public class WrapProduct{

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

        public WrapProduct( PricebookEntry productData){


            this.id           = productData.Product2Id;
            this.proUom       = productData.Product2.UOM__c;
            this.proCode      = productData.Product2.ProductCode;
            this.name         = productData.Product2.Name;
            this.unitPrice    = productData.UnitPrice;
            this.quantity     = productData.Product2.Quantity__c;
            this.family       = productData.Product2.Family;
            this.westCode     = productData.Product2.West_Material_Code__c;
            this.fullDesc     = productData.Product2.Description;
            // this.gst          = productData.Product2.GST__c;
            if(productData.Product2.Product_Image__c == '' || productData.Product2.Product_Image__c == null){
                this.imgSrc   = null;
            }else{
                this.imgSrc   = productData.Product2.Product_Image__c;
            }
        }
    }
}