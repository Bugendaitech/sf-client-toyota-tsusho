public class UpdateOrderStatusDraftToPendingHandler {

    private static final String DRAFT_STATUS = 'Draft';
    private static final String PENDING_STATUS = 'Approval Pending';

    public static void handleUpdateOrders(List<Order> newOrders, Map<Id, Order> oldOrdersMap) {

        List<String> orderIds = new List<String>();

        for (Order orderItr : newOrders) {

            if (orderItr.Status == null || orderItr.Status == DRAFT_STATUS) {

                orderIds.add(orderItr.Id);

            } else {

                Order oldOrder = oldOrdersMap.get(orderItr.Id);

                if (oldOrder != null && oldOrder.Status == DRAFT_STATUS) {
                    orderItr.addError('Once the status is changed from Draft, it cannot be set back to Draft.');
                }

            }
        }

        handleOrdersUpdate(orderIds);
    }

    @future
    public static void handleOrdersUpdate(List<String> orderIds) {
        
        List<Order> ordersToUpdate = new List<Order>();
        List<Contract> contractsToUpdate = new List<Contract>();
        
        List<Order> newOrders = [SELECT Id, Status, ContractId FROM Order WHERE Id IN :orderIds];
        
        for (Order ordersItr : newOrders) {
            
            ordersItr.Status = PENDING_STATUS;
            ordersToUpdate.add(ordersItr);
            
            // Assuming there is a Contract object with a field ContractId
            if (ordersItr.ContractId != null) {
                Contract relatedContract = new Contract(Id = ordersItr.ContractId, Status = 'Activated', ContractTerm = 1);
                contractsToUpdate.add(relatedContract);
            }
        }
        
        if (!ordersToUpdate.isEmpty()) {
            update ordersToUpdate;
        }
        
        if (!contractsToUpdate.isEmpty()) {
            update contractsToUpdate;
        }
    }
    
    
    
    
}