/**
 * @description       : Dealer Order form Controller
 * @author            : Velan Chinnasamy
 * @group             : Bugadaitech
 * @last modified on  : 12-14-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public without sharing class DealerOrderFormController {
    
@AuraEnabled(Cacheable = true) 
public static List<OrderItem> getOrderDetails(){
    List<OrderItem> ListofOrders = new List<OrderItem>();
    ListofOrders = [SELECT Id, Product2Id, Product2.Name, Order.Type, OrderId, Description, Quantity, UnitPrice, TotalPrice, OrderItemNumber FROM OrderItem Limit 5];
    return ListofOrders;
    
    }
}