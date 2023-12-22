public class UpdateOrderStatusDraftToPendingHandler {
    
    private static final String DRAFT_STATUS = 'Draft';
    private static final String PENDING_STATUS = 'Approval Pending';
    
    public static void handleOrders(List<Order> newOrders, Map<Id, Order> oldOrdersMap) {
        for (Order ord : newOrders) {
            if (ord.Status == null || ord.Status == DRAFT_STATUS) {
                ord.Status = PENDING_STATUS;
            } else {
                Order oldOrder = oldOrdersMap.get(ord.Id);
                if (oldOrder != null && oldOrder.Status == DRAFT_STATUS) {
                    ord.addError('Once the status is changed from Draft, it cannot be set back to Draft.');
                }
            }
        }
    }
}