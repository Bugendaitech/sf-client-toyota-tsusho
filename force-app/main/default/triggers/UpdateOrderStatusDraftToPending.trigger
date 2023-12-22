trigger UpdateOrderStatusDraftToPending on Order (after insert) {
  
    if (Trigger.isAfter) {
        
        if (Trigger.isInsert || Trigger.isUpdate) {
            
            UpdateOrderStatusDraftToPendingHandler.handleOrders(Trigger.new, Trigger.oldMap);
        }
    }
 
}