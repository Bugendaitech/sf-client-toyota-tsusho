public with sharing class globalSearch {

    public static Id pricebookId = AddToCart_Ctrl.getPricebookIdByName('Toyota_Price_Book');


    // @AuraEnabled(cacheable = true)
    // public static List<Product2> getAllProducts(){

    //     User userDetails   			= GetLoggedInUserDetails_Ctrl.getUserDetails();
    //     String warehouseId          = userDetails.WarehouseId__c;

    //     List<Product2> prodcutList = [SELECT Id,Name,Product_Image__c,Product_Price__c FROM Product2 ORDER BY Name ASC];
    //     return prodcutList;
           
    // }

    @AuraEnabled(cacheable=true)
    public static String getFilteredProduct(String prodName) {

            String key = '%' + prodName + '%';
            System.debug('Search KEy : '+prodName);
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

            Set<Id> warehouseProducts   = new Set<Id>();
            Map<Id,Decimal>  mapOfStock = new Map<Id,Decimal>();

            String warehouseId        = userDetails.WarehouseId__c; // 'a059I000002zjYtQAI'; //

            for (Stock__c stock :  [SELECT
                                        Product__c,
                                        Quantity__c
                                    FROM
                                        Stock__c
                                    WHERE
                                        Warehouse__c = : warehouseId
                                    WITH
                                        USER_MODE]) {
                // Add each product ID to the Set
                warehouseProducts.add(stock.Product__c);
                mapOfStock.put(stock.Product__c,stock.Quantity__c);
            }

            System.debug('WarehouseProducts  ' + warehouseProducts);
            List<PricebookEntry> pbeList    =  [SELECT
                                                    Product2Id,
                                                    Product2.Family,
                                                    Product2.Name,
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
                                                    Product2.Name LIKE:key
                                                AND
                                                    Pricebook2Id =: pricebookId
                                                WITH
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
}