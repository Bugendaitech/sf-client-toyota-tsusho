public with sharing class showOrdersCtrl {
  
    @AuraEnabled(cacheable=true)
    public static String getOrderDetails(){
        try{

            String userId  = UserInfo.getUserId();
            List<Order> orderList ;
    
            User user     = [SELECT Name, Id, AccountId__c,isDealer__c FROM User WHERE Id =: userId];
           // String accountId = String.valueOf(user.AccountId__c).substring(0, 15);
    
           if(user.isDealer__c == true){
    
               orderList = [SELECT Id, TotalAmount, EffectiveDate , OrderNumber, Type, ContractId, Status FROM Order WHERE Parent_AccountId__c =:user.AccountId__c ORDER BY CreatedDate DESC];
    
           }else{
    
               orderList = [SELECT Id, TotalAmount, EffectiveDate , OrderNumber, Type, ContractId, Status FROM Order WHERE AccountId =:user.AccountId__c ORDER BY CreatedDate DESC];
           }
           return JSON.serialize(orderList);

        }catch(Exception e){

            return e.getMessage();
        }

       
    }

    @AuraEnabled
    public static String updateOrder(String orderId,String status){
        List<Order> orderList = [SELECT Id, TotalAmount, EffectiveDate , OrderNumber, Type, ContractId, Account.Name,Status FROM Order WHERE Id =: orderId];
        if(!orderList.isEmpty()){
            orderList[0].Status = status;
            update orderList;
            return 'Success';
        }else{
            return 'Error';
        }
    }

    @AuraEnabled(cacheable=true)
    public static String getOrderItemDetails(String orderId){
        List<OrderItem> orderItemList = [SELECT Id,OrderId,UnitPrice,TotalPrice,Quantity,Product2.Name,
        Product2.Description,Product2.GST__c,Product2.Family, Order.Account.Name,Order.Account.BillingStreet,
        Order.Account.BillingCity, Order.Account.BillingState,Order.Account.Phone,Order.OrderNumber,
        Order.BillingStreet,Order.BillingCity, Order.BillingState,Order.BillingPostalCode, Order.BillingCountry,
        Order.Account.BillingPostalCode, Order.Account.BillingCountry,Order.EffectiveDate,Product2.Product_Image__c
        FROM OrderItem WHERE OrderId =:orderId];
        return JSON.serialize(orderItemList);
    }

}