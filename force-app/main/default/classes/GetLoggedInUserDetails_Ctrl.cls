/**
 * @description       :
 * @author            : Anshul Kanaujia
 * @group             : BT Team
 * @last modified on  : 12-20-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public without sharing class GetLoggedInUserDetails_Ctrl {


    public static User getUserDetails() {

        String userId =  UserInfo.getUserId(); // '0059I0000033MmPQAU'; //  '0059I0000033MmPQAU';  //

        User userInfo = [SELECT
                            Id,
                            AccountId,
                            Account.ParentId,
                            isDealer__c,
                            ContactId,
                            contact.name,
                            contact.accountId,
                            contact.ReportsToId,
                            Profile_Name__c,
                            Email,
                            WarehouseId__c,
                            Warehouse_Name__c
                        FROM
                            User
                        WHERE
                            Id = :userId
                        WITH
                            USER_MODE];
        if (userInfo != null) {
            system.debug('User details found in Constructor of GetLoggedInUserDetails_Ctrl');
            system.debug('User details: ' + userInfo);
            return userInfo;
        } else {
            system.debug('User details not found in Constructor of GetLoggedInUserDetails_Ctrl');
            return null;
        }
    }

    public static User getDealerUserInfo(String uid) {
        User userInfo = [SELECT
                            Id,
                            AccountId,
                            Account.ParentId,
                            isDealer__c,
                            ContactId,
                            contact.name,
                            contact.ReportsToId,
                            Profile_Name__c,
                            Email,
                            WarehouseId__c,
                            Warehouse_Name__c
                        FROM
                            User
                        WHERE
                        ContactId = :uid
                        WITH
                            USER_MODE];
        if (userInfo != null) {
            system.debug('User details found in getDealerUserInfo of GetLoggedInUserDetails_Ctrl');
            system.debug('User details: ' + userInfo);
            return userInfo;
        } else {
            system.debug('User details not found in getDealerUserInfo of GetLoggedInUserDetails_Ctrl');
            return null;
        }
    }

}