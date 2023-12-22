public class addProductToProductCount {
    public static void addProd(List<product2> prod){
        List<Product_Count__c> pcInsert = New List<Product_Count__c>();
        
        for(product2 prodTemp : prod){
            Product_Count__c pcNew = New Product_Count__c();
            pcNew.Product__c = prodTemp.id;
            pcNew.Product_Count__c = 0;
            pcInsert.add(pcNew);
        }
        insert pcInsert;
    }
}