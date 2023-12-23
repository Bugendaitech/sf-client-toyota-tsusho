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

        List<Order> newOrders = [SELECT Id, Status FROM Order WHERE Id IN :orderIds];

        for (Order ordersItr : newOrders) {

            ordersItr.Status = PENDING_STATUS;
            ordersToUpdate.add(ordersItr);
        }

        update ordersToUpdate;
    }
}