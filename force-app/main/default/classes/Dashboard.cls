public without sharing class Dashboard {
    public Dashboard() {

    }


    @AuraEnabled(cacheable = true)
    public static string getAllOrders(String userId){
        try {
            
            List<Order> orderList = [SELECT Id,OrderNumber, TotalAmount, EffectiveDate, Status FROM Order WHERE AccountId =: userId ORDER BY OrderNumber DESC];
            return JSON.serialize(orderList);

        } catch (Exception e) {
            //throw new AuraHandledException(e.getMessage());
            System.debug('error :'+ e.getMessage());
            return 'error';
        }
    }


    @AuraEnabled(cacheable = false)
    public static string getOrderDetails(String ordId){
        try {
            
            Order orderDetails = [SELECT Id,OrderNumber, AccountId,Account.Name,Account.Phone,Account.Person_Email__c,Account.BillingStreet,Account.BillingPostalCode,Account.BillingState,Account.BillingCity,Account.BillingCountry, TotalAmount, EffectiveDate, Status,(SELECT Id,UnitPrice,TotalPrice,Quantity,Product2Id,Product2.Name,Product2.Product_Image__c FROM OrderItems) FROM Order WHERE Id =: ordId];
            return JSON.serialize(orderDetails);

        } catch (Exception e) {
            //throw new AuraHandledException(e.getMessage());
            System.debug('error :'+ e.getMessage());
            return 'error';
        }
    }
}