/**
 @author        : Anshul Kanaujia 
 @created date  : 04/05/2023
 @last modified : ==================
 @cmp           : ==================
 @test Class    : Checkout_Test
 @desc          : For Checkout
 
 @imp note      : ====================== Please do not change this class without my permession ===================
*/



public without sharing class Checkout {
 
    public Static void createDummyData(){       
        
	//Id priceBookId     = '01s5i00000EGHG2AAP';
    Id priceBookId       = [SELECT Id FROM PricebookEntry WHERE Product2.Name = 'Charger' LIMIT 1].Id;

        
    Contract conData     = new Contract();
    conData.Pricebook2Id = '01s5i00000EGHG2AAP'; // 01s5i00000EGHG2AAP
    conData.AccountId    = '0015i00000g15MHAAY'; 
    conData.Status       = 'Draft'; 
    conData.StartDate    = Date.today();         
    insert conData;
    ////System.debug('conData ::'+conData.id);
    
    Order orderData			     = new Order();
    orderData.AccountId          =  '0015i00000g15MHAAY'; 
    orderData.EffectiveDate      =  Date.today(); 
    orderData.ContractId         =  conData.Id;
    orderData.Status             = 'Draft'; 
    insert orderData;
    ////System.debug('orderData ::'+orderData.id);
     
    // set all the items
    List<OrderItem> ordLists     = new List<OrderItem>();
        
    // Set the required fields on the Order Item object for the first product
    OrderItem orderItem1         = new OrderItem();
    orderItem1.OrderId           = orderData.Id; // Set the Order Id for the Order Item
    orderItem1.PricebookEntryId  = priceBookId; // Set the Pricebook Entry Id for the Product
    orderItem1.Quantity          = 1; // Set the Quantity of the Product to be added to the Order
    orderItem1.UnitPrice         = 100.0; // Set the Unit Price of the Product
    // Set any other required fields on the Order Item object for the first product
    
    // Set the required fields on the Order Item object for the first product
    OrderItem orderItem2         = new OrderItem(); 
    orderItem2.OrderId           = orderData.Id; // Set the Order Id for the Order Item
    orderItem2.PricebookEntryId  = priceBookId; // Set the Pricebook Entry Id for the Product
    orderItem2.Quantity          = 1; // Set the Quantity of the Product to be added to the Order
    orderItem2.UnitPrice         = 100.0; // Set the Unit Price of the Product // 
    // Set any other required fields on the Order Item object for the first product
    //insert orderItem1;
    ordLists.add(orderItem1);
    ordLists.add(orderItem2);
    
    ////System.debug('ordLists '+ordLists);
        
    }
     

    @AuraEnabled(cacheable = false)
    public static String checkoutProcess(String orderDetails, String lineItems){
        try {
              
            //System.debug('lineItems ::'+lineItems);

            Order  orderData                = (Order) JSON.deserialize(orderDetails, Order.class);
            List<OrderItem>  lineItemData   = (List<OrderItem>) JSON.deserialize(lineItems, List<OrderItem>.class);
            ////System.debug('OrderItem '+lineItemData);
            
            String accId           = orderData.AccountId;

            //Id priceBookId       = '01s5i00000EGHG2AAP';
            Set<Id> proIds         = new Set<Id>();
            for(OrderItem ordItem : lineItemData){
                proIds.add(ordItem.Product2Id);
            }

            Contract conData     = new Contract();
            conData.Pricebook2Id = '01s9I0000003OPBQA2'; // 01s5i00000EGHG2AAP 	01s5i00000EGHG2AAP 01u5i000001ceWSAAY
            conData.AccountId    = accId; 
            conData.Status       = 'Draft'; 
            conData.StartDate    = Date.today();         
            insert conData;
            ////System.debug('conData ::'+conData.id);

            Id contractId = conData.id;
              
            orderData.EffectiveDate      =  Date.today(); 
            orderData.ContractId         =  conData.Id;
            orderData.Status             = 'Draft'; 
            insert orderData;
            ////System.debug('orderData ::'+orderData.id); 

            Id orderId     = orderData.id;
            Id ordPriceId  = '01s9I0000003OPBQA2';
            ////System.debug('orderId ::'+orderId);
            ////System.debug('ordPriceId ::'+ordPriceId);
            

            List<PricebookEntry> priceBookList          = new List<PricebookEntry>();
            Map<Id,Id> mapOfProIdAndPriceBookId         = new Map<Id,Id>();
            Map<Id,Product2> mapOfIdAndProduct          = new Map<Id,Product2>();
            

            //System.debug('proIds '+proIds);
            if(!proIds.isEmpty()){
                priceBookList    = [SELECT Id,Product2Id,Product2.Quantity__c FROM PricebookEntry WHERE Product2Id IN : proIds AND Pricebook2Id =: ordPriceId];
				//System.debug('priceBookList '+priceBookList);
                if(!priceBookList.isEmpty()){
                    for(PricebookEntry priceItem : priceBookList){
                        Product2  proData    = new Product2();
                        proData.Id           =  priceItem.Product2Id;
                        proData.Quantity__c  =  priceItem.Product2.Quantity__c;

                        mapOfProIdAndPriceBookId.put(priceItem.Product2Id,priceItem.Id);
                        mapOfIdAndProduct.put(priceItem.Product2Id,proData);
                    }                    
                }
            }
            
            //System.debug('mapOfIdAndProduct '+mapOfIdAndProduct);
            //List<Product2> proList  = [SELECT Id,Quantity__c  FROM Product2 WHERE Id IN : proIds];
            //Id priceBookId       = [SELECT Id FROM PricebookEntry WHERE Product2.Name = 'Charger' LIMIT 1].Id;
            
            // List<Product2> proList = 
            
            Double  proQuantity              = 0; 
            List<Product2> proListForUpdate  = new List<Product2>();

            for(OrderItem lineItem : lineItemData){

                proQuantity                = 0; 
                Product2  proItem          = mapOfIdAndProduct.get(lineItem.Product2Id);

                lineItem.PricebookEntryId  = mapOfProIdAndPriceBookId.get(lineItem.Product2Id);
                lineItem.OrderId           = orderId;

                // check quantity 

                if(proItem.Quantity__c   >= lineItem.Quantity){
                    proQuantity = proItem.Quantity__c - lineItem.Quantity;
                } 

                proItem.Quantity__c        = proQuantity;
                proListForUpdate.add(proItem);

            }
            
            //System.debug('lineItemData After '+lineItemData);
            //System.debug('proListForUpdate After '+proListForUpdate);
            insert lineItemData;

            if(!proListForUpdate.isEmpty()){
                update proListForUpdate;
            }
            
            return 'success';
        
        } catch (Exception e) {
            //throw new AuraHandledException(e.getMessage());
            ////System.debug('error log ::'+JSON.serialize(e.getMessage()));
            return JSON.serialize(e.getMessage());
        }
    }

}