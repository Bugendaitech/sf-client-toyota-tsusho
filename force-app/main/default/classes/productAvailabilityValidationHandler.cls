public class productAvailabilityValidationHandler {
    
    public static Void CheckProductQuanity(List<OpportunityLineItem> newoppList){
        
        List<Id> productIds = new List<Id>();
        for(OpportunityLineItem item : newoppList)
        {
            productIds.add(item.Product2Id);
        }
        System.debug('productIds:-'+productIds);
        
        List<Product2> ProductList = [SELECT id, ProductCode , Name , Quantity__c  FROM Product2 WHERE Id IN : productIds];  
        system.debug('ProductList:-' + ProductList);
        
        for(OpportunityLineItem oppItem : newoppList){
            
            System.debug('oppItem:-'+oppItem.id + '--'+oppItem.Quantity);
            for(Product2 product : ProductList){
                
				System.debug('product:-'+product.id + '--'+product.Quantity__c);
                
                if(oppItem.Quantity > product.Quantity__c)
                {
                    System.debug('oppItem.Quantity > product.Quantity__c:-'+ (oppItem.Quantity > product.Quantity__c));
	        		oppItem.Quantity.addError('Please Enter Quantity less than: '+product.Quantity__c);
                }
                else
                {
                    continue;
                }
            }
        }
    }       
       
}