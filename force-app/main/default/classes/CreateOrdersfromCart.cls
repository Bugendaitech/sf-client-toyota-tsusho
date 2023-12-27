public without sharing class CreateOrdersfromCart {
    
    @AuraEnabled(cacheable=true)
    public static List<String> getHeadOfficeAddress(){
        try {
            User currentUser = GetLoggedInUserDetails_Ctrl.getUserDetails();

            List<String> addressList = new List<String>();
            if(currentUser.isDealer__c == false){
                // Account parentAcc =[SELECT Id,BillingStreet,BillingCity,BillingState,BillingPostalCode
                //                     FROM Account
                //                     WHERE Id =: currentUser.accountId LIMIT 1
                //                     ];
                Contact parentCont = [SELECT Id, MailingStreet, MailingCity, MailingState, MailingPostalCode,MailingCountry
                                      FROM Contact WHERE Id =: currentUser.contact.ReportsToId LIMIT 1
                                        ];
                String addressString = '';
                addressString += parentCont.MailingStreet;
                addressString += '\n'+parentCont.MailingCity;
                addressString += '\n'+parentCont.MailingState;
                addressString += '\n'+parentCont.MailingPostalCode;

                addressList = addressString.split('\n');

                return addressList;
                
            }
            else if(currentUser.isDealer__c == true){
                Contact parentCont =[SELECT Id,MailingStreet, MailingCity, MailingState, MailingPostalCode,MailingCountry
                                    FROM Contact
                                    WHERE Id =: currentUser.contactId LIMIT 1
                                    ];
                String addressString = '';
                addressString += parentCont.MailingStreet;
                addressString += '\n'+parentCont.MailingCity;
                addressString += '\n'+parentCont.MailingState;
                addressString += '\n'+parentCont.MailingPostalCode;

                addressList = addressString.split('\n');

                return addressList;
                
            }

            return addressList;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Contact> getShipToAddress(){
        try {
            //List<String> addresses = new List<String>();

            User currentUser = GetLoggedInUserDetails_Ctrl.getUserDetails();

            List<Contact> allOutlets =new List<Contact>();
             if(currentUser.isDealer__c == false){
                allOutlets = [SELECT Id,MailingStreet, MailingCity, MailingState, MailingPostalCode,MailingCountry
                              FROM Contact
                              WHERE ReportsToId =: currentUser.contact.ReportsToId
                 ];

                //  for(Account accRec: allOutlets){
                //     String address= accRec.BillingStreet+'\n'+accRec.BillingState+'\n'+accRec.BillingPostalCode;
                //     addresses.add(address);
                //  }
                system.debug('outlets address '+allOutlets);
             }
             else if(currentUser.isDealer__c == true){
                allOutlets = [SELECT Id,MailingStreet, MailingCity, MailingState, MailingPostalCode,MailingCountry
                                            FROM Contact
                                            WHERE ReportsToId =: currentUser.ContactId];
                system.debug('dealer outlets address '+allOutlets);
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

            Contact accForAddr = [SELECT Id,MailingStreet, MailingCity, MailingState, MailingPostalCode,MailingCountry
                                  FROM Contact 
                                  WHERE Id =: address];
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
            orderData.ShippingPostalCode  = accForAddr.MailingPostalCode;
            orderData.ShippingStreet      = accForAddr.MailingStreet;
            orderData.ShippingState       = accForAddr.MailingState;
            orderData.ShippingCity        = accForAddr.MailingCity;

            List<String> HOAddress        = getHeadOfficeAddress();
            system.debug('ho Addrrr---->>'+HOAddress);
            orderData.BillingCity         = HOAddress[1];
            orderData.BillingStreet       = HOAddress[0];
            orderData.BillingState        = HOAddress[2];
            orderData.BillingPostalCode   = HOAddress[3];

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
            
            //Push Notification
            // List<CustomNotificationType > notification1 = [SELECT Id, DeveloperName FROM CustomNotificationType
            //                                                     WHERE DeveloperName= 'Order_Submitted_For_Approval' ];

            // Messaging.CustomNotification currNotification = new Messaging.CustomNotification();
            // currNotification.setTitle('Order Approval needed! '+orderData.Name);
            // currNotification.setBody('Review the order from '+currentUser.contact.Name);
            // currNotification.setNotificationTypeId(notification1[0].Id);
            // currNotification.setTargetId(currentUser.contact.ReportsToId);
            // set<String> recepients = new Set<String>();
            // User u = GetLoggedInUserDetails_Ctrl.getDealerUserInfo(currentUser.contact.ReportsToId);
            // recepients.add(u.Id);
            // currNotification.send(recepients);
            


            return 'success';
        }
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
            ////System.debug('error log ::'+JSON.serialize(e.getMessage()));
            // return JSON.serialize(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static String getToyotaLogoId() {
        ContentDocument cd = [SELECT Id FROM ContentDocument WHERE Title = 'ToyotaLogo' LIMIT 1];
        return cd.Id;
    }

    @AuraEnabled(cacheable=true)
    public static Account getTTIPLinfo() {
        Account acc = [SELECT Id, BillingStreet,BillingCity,BillingState,BillingPostalCode,PAN_Number__c,GST_Number__c,logo__c
                      FROM Account WHERE PAN_Number__c = 'AADCS6230N'
                      LIMIT 1];
                      system.debug('accInfo '+acc);
        return acc;
    }

    @AuraEnabled(cacheable=true)
    public static Account getCurrentContactinfo() {

        User currentUser = GetLoggedInUserDetails_Ctrl.getUserDetails();

        Account conRecord =[SELECT Id,Customer_ID__c FROM Account WHERE Id =: currentUser.contact.AccountId LIMIT 1];
        return conRecord;
    }
}