public without sharing class OrderApprovalHandler {

    

    @InvocableMethod(label='Check Order Stock')
    public static List<ReturnVars> checkOrderStock(List<String> orderIds) {
        
        User currentUser = GetLoggedInUserDetails_Ctrl.getUserDetails();
        
        //Warehouse__c WH=[];

        Order myOrder = [SELECT Id, Name, ownerId, BillToContactId,ShippingStreet,ShippingCity,ShippingState,ShippingPostalCode,
                        (SELECT Id, UnitPrice,Quantity, Product2Id,Product2.Name, product2.ProductCode
                                            FROM OrderItems)
                        
                        FROM Order WHERE Id = :orderIds[0]];
                        system.debug('myOrder '+myOrder);

        User orderUser = [select id, WarehouseId__c FROM User WHERE Id=: myOrder.OwnerId];
        system.debug('order Owner '+orderUser);

        String CurrentWarehouseId = orderUser.WarehouseId__c;
        Set<Id> orderItemIds = new Set<Id>();

        for(OrderItem item: myOrder.OrderItems){
            orderItemIds.add(item.Product2Id);
        }

        //get All stocks related to orderItems   Warehouse__r.Warehouse_Code__c,
        List<Stock__c> stocks = [SELECT Id, Product__c,Product__r.ProductCode,Product__r.Name,Warehouse__c,
                                       Quantity__c
                                        FROM Stock__c WHERE Product__c IN: orderItemIds AND Warehouse__c =: CurrentWarehouseId];

        
        Map<String,Stock__c> stockMap = new Map<String,Stock__c>();
        for(Stock__c stockRecord: stocks){
            
            String prod_WH =  stockRecord.Product__c +'~'+CurrentWarehouseId;
            system.debug('prod_WH '+prod_WH);
                stockMap.put(prod_WH, stockRecord);
        }
        
        List<OrderItem> OIUpdateList = new List<OrderItem>();
        List<OrderItem> BackOrderItemList = new List<OrderItem>();
        List<Stock__c> StockUpdateList = new List<Stock__c>();
        
        for(OrderItem item: myOrder.OrderItems ){
            String prod_WH = item.Product2Id+'~'+CurrentWarehouseId;
            if(stockMap.containsKey(prod_WH)){
                Stock__c stock = stockMap.get(prod_WH);
                Double backOrderQuantity = 0;
                system.debug('stock quantity '+stock.Quantity__c);
                system.debug('Item quantity '+item.Quantity);
                if(item.quantity > stock.Quantity__c){
                    system.debug('backorder proces...');
                    backOrderQuantity = item.quantity - stock.Quantity__c;
                    
                    if(stock.Quantity__c !=0){
                        item.quantity = stock.Quantity__c;   
                        OIUpdateList.add(item);    
                    }
                    stock.Quantity__c = 0;
                    
                    //Create New Order Item
                    OrderItem BO_itemRecord = new OrderItem();
                    BO_itemRecord.UnitPrice = item.UnitPrice;
                    BO_itemRecord.quantity = backOrderQuantity;
                    BO_itemRecord.Product2Id = item.Product2Id;
                    BackOrderItemList.add(BO_itemRecord);
                }
                else{
                    stock.Quantity__c = stock.Quantity__c - item.quantity; 
                }
                StockUpdateList.add(stock);
            }
        }
        List<ReturnVars> returnlist = new List<ReturnVars>();
        ReturnVars retVar = new ReturnVars();
        retVar.StockVerified = 'true';
        update StockUpdateList; //update stocks...
        if(BackOrderItemList.size()>0){
            update OIUpdateList; // update current orderItem
            Order BackOrder = new Order();
            BackOrder.Type  = 'Back Order';
            BackOrder.ShippingStreet = myOrder.ShippingStreet;
            BackOrder.ShippingCity = myOrder.ShippingCity;
            BackOrder.ShippingState = myOrder.ShippingState;
            BackOrder.ShippingPostalCode = myOrder.ShippingPostalCode;

            Id result = CreateOrdersfromCart.createOrders(JSON.serialize(BackOrder), JSON.serialize(BackOrderItemList), myOrder.BillToContactId, 'backorder');
            retVar.BackOrderId = result;
            returnlist.add(retVar);
            
        }
        else{
            returnlist.add(retVar);
        }
        return returnlist;
    }
    public class ReturnVars{
        @InvocableVariable
        public String StockVerified;

        @InvocableVariable
        public Id BackOrderId;
    }
}