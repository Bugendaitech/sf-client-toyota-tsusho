/*trigger WarehouseProductTrigger on Stock__c (before insert, before update) {
    for (Stock__c wp : Trigger.new) {
        // Query to check if any record with the same Warehouse and Product exists
        List<Stock__c> existingRecords = [SELECT Id FROM Stock__c WHERE Warehouse__c = :wp.Warehouse__c AND Product__c = :wp.Product__c LIMIT 1];
 
        if (!existingRecords.isEmpty()) {
            wp.addError('This product is already added to the warehouse.');
        }
    }
}*/

trigger PreventDuplicateRecordTrigger on Stock__c (before insert) {
    // Map to store existing combinations of Warehouse__c and Product__c values
    Map<String, Boolean> existingCombinations = new Map<String, Boolean>();

    // Populate the map with existing data
    for (Stock__c item : [SELECT Warehouse__c, Product__c FROM Stock__c]) {
        String key = item.Warehouse__c + '-' + item.Product__c;
        existingCombinations.put(key, true);
    }

    // Check new records against existing combinations
    for (Stock__c newItem : Trigger.new) {
        String newKey = newItem.Warehouse__c + '-' + newItem.Product__c;
        if (existingCombinations.containsKey(newKey)) {
            newItem.addError('A record with the same Warehouse__c and Product__c values already exists.');
        }
    }
}