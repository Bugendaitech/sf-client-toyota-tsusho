public without sharing class CarouselCtrl {
    public CarouselCtrl() {

    }
    @AuraEnabled(cacheable=true)
    public static List<News__c>  getNewsdata(){
            
            List<News__c> newsdata = [SELECT Id,Name,Spotlight__c ,Title__c,Has_Button__c,Image_URL__c,  Body__c ,Button_URL__c,For_Welcome__c,Index__c,Slide_Class__c,Icon_Class__c,Button_Title__c  FROM News__c WHERE Active__c = True ORDER BY Index__c ];
            return newsdata;
    }
}