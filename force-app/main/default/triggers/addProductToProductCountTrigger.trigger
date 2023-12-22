trigger addProductToProductCountTrigger on Product2 (after insert) {
	addProductToProductCount.addProd(Trigger.New);
}