/**
 * @description       :
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             :
 * @last modified on  : 12-25-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class CartItemCtrl {

    @AuraEnabled
    public static Decimal fetchCartItems(){
        Decimal totalItem ;
        String userId = UserInfo.getUserId();
        User user     = [SELECT Name, Id, AccountId__c, contactId FROM User WHERE Id =: userId];
        String conId  = user.contactId;
        AggregateResult[] results = [SELECT COUNT(Id) totalItem FROM Cart__c WHERE Outlet__c = :conId GROUP BY Outlet__c];

        if (!results.isEmpty()) {
            totalItem = (Decimal)results[0].get('totalItem');
            System.debug('Total Quantity: ' + totalItem);
        } else {
            System.debug('No results found.');
            totalItem = 0;
        }

        return totalItem;
    }

}