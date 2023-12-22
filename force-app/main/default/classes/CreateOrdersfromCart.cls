public with sharing class CreateOrdersfromCart {
    
    @AuraEnabled(cacheable=true)
    public static List<String> getHeadOfficeAddress(){
        try {
            User currentUser = GetLoggedInUserDetails_Ctrl.getUserDetails();

            List<String> addressList = new List<String>();
            if(currentUser.isDealer__c == false){
                Account parentAcc =[SELECT Id,BillingStreet,BillingCity,BillingState,BillingPostalCode
                                    FROM Account
                                    WHERE Id =: currentUser.account.ParentId LIMIT 1
                                    ];
                String addressString = '';
                addressString += parentAcc.BillingStreet;
                addressString += '\n'+parentAcc.BillingCity;
                addressString += '\n'+parentAcc.BillingState;
                addressString += '\n'+parentAcc.BillingPostalCode;

                addressList = addressString.split('\n');

                return addressList;
                
            }
            else if(currentUser.isDealer__c == true){
                Account parentAcc =[SELECT Id,BillingStreet,BillingCity,BillingState,BillingPostalCode
                                    FROM Account
                                    WHERE Id =: currentUser.accountId LIMIT 1
                                    ];
                String addressString = '';
                addressString += parentAcc.BillingStreet;
                addressString += '\n'+parentAcc.BillingCity;
                addressString += '\n'+parentAcc.BillingState;
                addressString += '\n'+parentAcc.BillingPostalCode;

                addressList = addressString.split('\n');

                return addressList;
                
            }

            return addressList;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Account> getShipToAddress(){
        try {
            List<String> addresses = new List<String>();

            User currentUser = GetLoggedInUserDetails_Ctrl.getUserDetails();

            List<Account> allOutlets =new List<Account>();
             if(currentUser.isDealer__c == false){
                allOutlets = [SELECT Id,BillingStreet,BillingState,BillingPostalCode
                                            FROM Account
                                            WHERE ParentId =: currentUser.account.ParentId
                 ];

                //  for(Account accRec: allOutlets){
                //     String address= accRec.BillingStreet+'\n'+accRec.BillingState+'\n'+accRec.BillingPostalCode;
                //     addresses.add(address);
                //  }
             }
             else if(currentUser.isDealer__c == true){
                allOutlets = [SELECT Id,BillingStreet,BillingState,BillingPostalCode
                                            FROM Account
                                            WHERE ParentId =: currentUser.AccountId];
             }
               return allOutlets;                 

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


    @AuraEnabled
    public static String createOrders(String orderDetails, String lineItems, String address){
        try {
            User currentUser = GetLoggedInUserDetails_Ctrl.getUserDetails();

            Account accForAddr = [SELECT Id, BillingStreet,BillingPostalCode,BillingState,BillingCity FROM Account WHERE Id=:address];
            //Map<String, Object> orderData = (Map<String, Object>)JSON.deserializeUntyped(jsonInput);
            
            Order  orderData                = (Order) JSON.deserialize(orderDetails, Order.class);
            List<OrderItem>  lineItemData   = (List<OrderItem>) JSON.deserialize(lineItems, List<OrderItem>.class);
            System.debug('lineItemsData ::'+lineItemData);

            String accId                    = currentUser.accountId;
            
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

            Id contractId = conData.id;


            orderData.Type               =  'Regular';
            orderData.EffectiveDate      =  Date.today(); 
            orderData.ContractId         =  conData.Id;
            orderData.Status             = 'Draft';
            orderData.AccountId          = accId;
            orderData.BillToContactId    = currentUser.contactId;
            orderData.ShippingPostalCode  = accForAddr.BillingPostalCode;
            orderData.ShippingStreet      = accForAddr.BillingStreet;
            orderData.ShippingState       = accForAddr.BillingState;
            orderData.ShippingCity        = accForAddr.BillingCity;

            orderData.BillingCity         = 'Bidadi Ramanagara District';
            orderData.BillingStreet       = 'Plot No 33,34 Bidadi industrial Area';
            orderData.BillingState        = 'Karnataka';
            orderData.BillingPostalCode   = '562109';

            insert orderData;


            Id orderId     = orderData.id;
            Id ordPriceId  = '01s9I0000003OPBQA2';


            List<PricebookEntry> priceBookList          = new List<PricebookEntry>();
            Map<Id,Id> mapOfProIdAndPriceBookId         = new Map<Id,Id>();
            Map<Id,Product2> mapOfIdAndProduct          = new Map<Id,Product2>();

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

            insert lineItemData;


            if(!proListForUpdate.isEmpty()){
                update proListForUpdate;
            }



            return 'success';
        }
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
            ////System.debug('error log ::'+JSON.serialize(e.getMessage()));
            // return JSON.serialize(e.getMessage());
        }




    }
}