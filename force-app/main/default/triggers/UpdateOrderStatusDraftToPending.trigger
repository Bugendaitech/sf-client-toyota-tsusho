trigger UpdateOrderStatusDraftToPending on Order (after insert) {
  
    if (Trigger.isAfter) {
        
        if (Trigger.isInsert) {
            
            UpdateOrderStatusDraftToPendingHandler.handleUpdateOrders(Trigger.new, Trigger.oldMap);
        }
    }
 
}