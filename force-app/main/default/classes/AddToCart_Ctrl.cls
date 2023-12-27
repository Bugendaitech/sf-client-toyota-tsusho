/**
 * @description       : All Cart related functionality (Add,Increase,Decrease,Remove,TotalCount,All Products in Cart)
 * @author            : Anshul Kanaujia
 * @group             : BT Team
 * @last modified on  : 12-26-2023
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class AddToCart_Ctrl {

    public static Id pricebookId = AddToCart_Ctrl.getPricebookIdByName('Toyota_Price_Book');


    public AddToCart_Ctrl() {
        System.debug('constructor called');
    }


    /**
     * Adds a product to the user's cart.
     * @param productId The ID of the product to be added to the cart.
     * @return A JSON string containing the status of the operation, total items in the cart, and cart items details.
     */
    @AuraEnabled
    public static string addProductToCart(String productId, Integer qty){

        System.debug('addProductToCart called '+pricebookId);

        User userDetails   			  = GetLoggedInUserDetails_Ctrl.getUserDetails();

        if(qty == null){
            qty = 1;
        }

        Map<String,Object> retMap     = new Map<String,Object>();

        if(userDetails != null && userDetails.ContactId != null && userDetails.WarehouseId__c != null){

            Boolean  isExist          = checkProductInCart(userDetails.ContactId,userDetails.WarehouseId__c,productId);

            if(!isExist){
                try {

                    Cart__c cartObj         = new Cart__c();
                    cartObj.Outlet__c       = userDetails.ContactId;
                    cartObj.Product__c      = productId;
                    cartObj.Warehouse__c    = userDetails.WarehouseId__c;
                    cartObj.Quantity__c     = qty;

                    System.debug('cartObj details for insert '+cartObj);

                    addProduct(cartObj);

                    Map<String,Object> cartItems  = totalProductsInCart(userDetails.ContactId,userDetails.WarehouseId__c);

                    retMap.put('status','success');
                    retMap.put('label','Success !');
                    retMap.put('totalItems',cartItems.get('totalItems'));
                    retMap.put('allItems',cartItems.get('items'));
                    retMap.put('msg','Product Added Successfully.');

                } catch (Exception ex) {

                    String errorMessage = 'Cause :' + ex.getCause() + '\n';
                    errorMessage += 'Line Number :' + ex.getLineNumber() + '\n';
                    errorMessage += 'Message :' + ex.getMessage() + '\n';
                    errorMessage += 'Stack Trace :' + ex.getStackTraceString() + '\n';
                    errorMessage += 'Type :' + ex.getTypeName() + '\n';

                    retMap.put('status','error');
                    retMap.put('label','Error !');
                    retMap.put('msg',errorMessage);
                    System.debug('Error '+errorMessage);

                }

            }else{

                retMap.put('status','warning');
                retMap.put('label','Warning !');
                retMap.put('msg','Product already Exist in your Cart.');

            }

        }else{
                retMap.put('status','error');
                retMap.put('label','Error !');
                retMap.put('msg','Warehouse Details Not Found.');
        }

        System.debug(retMap);
        return JSON.serialize(retMap);
    }



    /**
     * Performs an action on the quantity of a product in the user's cart (e.g., increase, decrease, remove).
     * @param actionType The type of action to be performed (e.g., 'Plus' for increase, 'Minus' for decrease, 'Remove' for removal).
     * @param cartId The ID of the cart item to be modified.
     * @return A JSON string containing the status of the operation, total items in the cart, and cart items details.
     */
    @AuraEnabled
    public static string actionOnQuantity(String actionType, String cartId ,Integer qty){

        User userDetails   			  = GetLoggedInUserDetails_Ctrl.getUserDetails();

        Map<String,Object> retMap     = new Map<String,Object>();

        if(userDetails != null && userDetails.ContactId != null && userDetails.WarehouseId__c != null){


            Decimal  curQty         = checkCurrentQty(cartId);

            Cart__c cartObj         = new Cart__c();
            cartObj.Id              = cartId;
            cartObj.Quantity__c     = curQty;


            if(curQty != 0){

                try {


                    if(actionType == 'remove' || (cartObj.Quantity__c == 1 && actionType == 'decrease')){

                        deleteItemFromCart(cartObj);
                        retMap.put('label','Success !');
                        retMap.put('msg','Product Removed Successfully.');

                    }else{

                        updateItemQtyInCart(actionType,cartObj,qty);
                        retMap.put('label','Success !');
                        retMap.put('msg','Quantity Updated Successfully.');

                    }

                    Map<String,Object> cartItems  = totalProductsInCart(userDetails.ContactId,userDetails.WarehouseId__c);

                    retMap.put('status','success');
                    retMap.put('totalItems',cartItems.get('totalItems'));
                    retMap.put('items',cartItems.get('items'));
                    retMap.put('gstAmt',cartItems.get('gstAmt'));
                    retMap.put('totalGstAmt',cartItems.get('totalGstAmt'));
                    retMap.put('totalExeAmt',cartItems.get('totalExeAmt'));
                    retMap.put('totalIncAmt',cartItems.get('totalIncAmt'));

                    // returnMap.put('totalGstAmt',totalGstAmt);
                    // returnMap.put('totalExeAmt',totalExeAmt);
                    // returnMap.put('totalIncAmt',totalIncAmt);


                } catch (Exception ex) {

                    String errorMessage = 'Cause :' + ex.getCause() + '\n';
                    errorMessage += 'Line Number :' + ex.getLineNumber() + '\n';
                    errorMessage += 'Message :' + ex.getMessage() + '\n';
                    errorMessage += 'Stack Trace :' + ex.getStackTraceString() + '\n';
                    errorMessage += 'Type :' + ex.getTypeName() + '\n';

                    retMap.put('status','error');
                    retMap.put('label','Error !');
                    retMap.put('msg',errorMessage);

                    System.debug('Error '+errorMessage);

                }

            }else{

                retMap.put('status','error');
                retMap.put('label','Error !');
                retMap.put('msg','Product not Exist in your Cart.');

            }

        }

        System.debug(retMap);
        return JSON.serialize(retMap);
    }


    @AuraEnabled
    public static string emptyCart(){

        Map<String,Object> retMap        = new Map<String,Object>();

        try {

            User userDetails   			  = GetLoggedInUserDetails_Ctrl.getUserDetails();

            if(userDetails != null && userDetails.ContactId != null){

                List<Cart__c> cartIds  =    [SELECT
                                                Id
                                            FROM
                                                Cart__c
                                            WHERE
                                                Outlet__c =: userDetails.ContactId
                                            WITH USER_MODE];

                if(!cartIds.isEmpty() && Schema.sObjectType.Cart__c.isDeletable()){

                    delete cartIds;

                    retMap.put('status','success');
                    retMap.put('label','Success !');
                    retMap.put('totalItems',0);
                    retMap.put('allItems',null);
                    retMap.put('msg','Cart Empty Successfully.');
                    retMap.put('totalGstAmt',0);
                    retMap.put('totalExeAmt',0);
                    retMap.put('totalIncAmt',0);
                }

            }


        } catch (Exception ex) {

                    String errorMessage = 'Cause :' + ex.getCause() + '\n';
                    errorMessage += 'Line Number :' + ex.getLineNumber() + '\n';
                    errorMessage += 'Message :' + ex.getMessage() + '\n';
                    errorMessage += 'Stack Trace :' + ex.getStackTraceString() + '\n';
                    errorMessage += 'Type :' + ex.getTypeName() + '\n';

                    retMap.put('status','error');
                    retMap.put('label','Error !');
                    retMap.put('msg',errorMessage);
                    System.debug('Error '+errorMessage);
        }

        System.debug(retMap);
        return JSON.serialize(retMap);
    }


    @AuraEnabled
    public static string getAllCartItems(){

        Map<String,Object> retMap      = new Map<String,Object>();
        try {
            User userDetails   			  = GetLoggedInUserDetails_Ctrl.getUserDetails();
            if(userDetails != null && userDetails.ContactId != null && userDetails.WarehouseId__c != null){

                retMap          = totalProductsInCart(userDetails.ContactId,userDetails.WarehouseId__c);

            }
        } catch (Exception ex) {

            String errorMessage = 'Cause :' + ex.getCause() + '\n';
            errorMessage += 'Line Number :' + ex.getLineNumber() + '\n';
            errorMessage += 'Message :' + ex.getMessage() + '\n';
            errorMessage += 'Stack Trace :' + ex.getStackTraceString() + '\n';
            errorMessage += 'Type :' + ex.getTypeName() + '\n';

            retMap.put('status','error');
            retMap.put('label','Error !');
            retMap.put('msg',errorMessage);
        }
        return JSON.serialize(retMap);
    }

    /**
     * Updates the quantity of a cart item based on the specified action type.
     * @param actionType The type of action to be performed ('Plus' for increase, 'Minus' for decrease).
     * @param cartObj The Cart__c object to be updated.
     */
    private static void updateItemQtyInCart(String actionType,Cart__c cartObj,Integer qty){

        if(qty == null){
            qty = 1;
        }

        if(actionType == 'manual'){
            cartObj.Quantity__c = qty;
        }

        if(actionType == 'increase'){
            cartObj.Quantity__c = cartObj.Quantity__c+qty;
        }

        if(actionType == 'decrease'){
            cartObj.Quantity__c = cartObj.Quantity__c-qty;
        }

        if (Schema.sObjectType.Cart__c.isUpdateable()) {
            update cartObj;
            System.debug('Cart Updated Successfully.');
        }

    }


    /**
     * Deletes a cart item from the user's cart.
     * @param cartObj The Cart__c object to be deleted.
     */
    private static void deleteItemFromCart(Cart__c cartObj){

        if (Schema.sObjectType.Cart__c.isDeletable()) {
            delete cartObj;
            System.debug('Cart Deleted Successfully.');
        }

    }



    /**
     * Checks the current quantity of a cart item.
     * @param cartId The ID of the cart item.
     * @return The current quantity of the cart item.
     */
    private static Decimal checkCurrentQty(String cartId){

        Decimal returnValue  = 0;

        if(cartId != null){
            Decimal curQty      =  [SELECT
                                        Id,
                                        Quantity__c
                                    FROM
                                        Cart__c
                                    WHERE
                                        Id =: cartId
                                    WITH
                                        USER_MODE
                                    LIMIT
                                        1
                                    ].Quantity__c;
            if(curQty != null){
                returnValue =  curQty;
            }
        }

        return returnValue;
    }



    /**
     * Checks if a product already exists in the user's cart.
     * @param contactId The ID of the contact associated with the user.
     * @param warehouseId The ID of the warehouse associated with the user.
     * @param productId The ID of the product to be checked.
     * @return True if the product exists in the cart; otherwise, false.
     */
    private static Boolean checkProductInCart(String contactId, String warehouseId, String productId){

        Boolean returnValue = false;

        if(contactId != null && warehouseId != null && productId != null){

            List<Cart__c> cartItem  =   [SELECT
                                            Id
                                        FROM
                                            Cart__c
                                        WHERE
                                            Outlet__c =: contactId
                                        AND
                                            Product__c =: productId
                                        AND
                                            Warehouse__c =: warehouseId
                                        WITH
                                            USER_MODE
                                        LIMIT
                                            1
                                        ];
            System.debug('cartItem '+cartItem);
            System.debug('cartItem size '+cartItem.size());

            if(cartItem.size() == 1){
                returnValue =  true;
            }
        }

        System.debug('returnValue '+returnValue);

        return returnValue;
    }



    /**
     * Retrieves a list of CartItem_Wrapper objects representing all products in the user's cart.
     * @param contactId The ID of the contact associated with the user.
     * @param warehouseId The ID of the warehouse associated with the user.
     * @return A list of CartItem_Wrapper objects representing products in the cart.
     */
    private static Map<String,Object> totalProductsInCart(String contactId, String warehouseId){

        Map<String,Object>  returnMap          = new Map<String,Object>();


        Map<Decimal,List<CartItem_Wrapper>>  cartItemMain   = new Map<Decimal,List<CartItem_Wrapper>>();


                    List<Cart__c> cartItems     =   [SELECT
                                                        Id,
                                                        Quantity__c,
                                                        Product__c,
                                                        Product__r.Name,
                                                        Product__r.Description,
                                                        Product__r.West_Material_Code__c,
                                                        // Product__r.GST__c,
                                                        Product__r.UOM__c,
                                                        Product__r.HSN_Code__c
                                                    FROM
                                                        Cart__c
                                                    WHERE
                                                        Outlet__c =: contactId
                                                    AND
                                                        Warehouse__c =: warehouseId
                                                    WITH
                                                        USER_MODE
                                                    ];

        Set<Id> allCartProductsId    = new Set<Id>();

        for(Cart__c cartIte  : cartItems){
            allCartProductsId.add(cartIte.Product__c);
        }

        Map<Id,Decimal> pricebookMap       = getPriceBookMap(allCartProductsId);

        Decimal gstAmt                     = 0;
        Decimal totalGstAmt                = 0;
        Decimal totalExeAmt                = 0;
        Decimal totalIncAmt                = 0;


        for(Cart__c  cartItem : cartItems){

            if(pricebookMap.containsKey(cartItem.Product__c)){

                CartItem_Wrapper cartWrap                            = new CartItem_Wrapper(cartItem,pricebookMap.get(cartItem.Product__c));

                gstAmt      = gstAmt + cartWrap.gstAmt;
                totalGstAmt = totalGstAmt + cartWrap.totGstAmt;
                totalExeAmt = totalExeAmt + cartWrap.exeAmt;
                totalIncAmt = totalIncAmt + cartWrap.incAmt;

                // if(cartItemMain.containsKey(cartItem.Product__r.GST__c)){
                //     cartItemMain.get(cartItem.Product__r.GST__c).add(cartWrap);
                // }else{
                //     List<CartItem_Wrapper> cartItemsList                = new List<CartItem_Wrapper>();
                //     cartItemsList.add(cartWrap);
                //     cartItemMain.put(cartItem.Product__r.GST__c,cartItemsList);
                // }
            }

        }

        returnMap.put('totalItems',cartItems.size());
        returnMap.put('items',cartItemMain);
        returnMap.put('gstAmt',gstAmt);
        returnMap.put('totalGstAmt',totalGstAmt);
        returnMap.put('totalExeAmt',totalExeAmt);
        returnMap.put('totalIncAmt',totalIncAmt);

        return returnMap;
    }



    /**
     * Retrieves the total count of products in the user's cart.
     * @param contactId The ID of the contact associated with the user.
     * @param warehouseId The ID of the warehouse associated with the user.
     * @return The total count of products in the cart.
     */
    private static Integer totalProductsCount(String contactId, String warehouseId){

        Integer totalProduct        = 0;
        List<Cart__c> cartItems     =   [SELECT
                                            Id
                                        FROM
                                            Cart__c
                                        WHERE
                                            Outlet__c =: contactId
                                        AND
                                            Warehouse__c =: warehouseId
                                        WITH
                                            USER_MODE
                                        ];
        if(!cartItems.isEmpty()){
            totalProduct   = cartItems.size();
        }

        return totalProduct;
    }



    /**
     * Adds a product to the user's cart.
     * @param cartObj The Cart__c object representing the product to be added.
     */
    private static void addProduct(Cart__c cartObj){

        if (Schema.sObjectType.Cart__c.isCreateable()) {
            insert cartObj;
            // System.debug('Leads Updated Successfully.');
        }
    }


    /**
     * Retrieves the Pricebook2 ID based on the provided pricebook name.
     * @param pricebookName The name of the pricebook.
     * @return The ID of the pricebook, or null if not found.
     */
    public static Id getPricebookIdByName(String pricebookName) {
        Id pricebookId;

        // Query for the PricebookId using the Pricebook2 object
        List<Pricebook2> pricebooks = [SELECT Id FROM Pricebook2 WHERE Name = :pricebookName LIMIT 1];

        // Check if a Pricebook was found
        if (pricebooks != null && !pricebooks.isEmpty()) {
            pricebookId = pricebooks[0].Id;
        }

        return pricebookId;
    }


    /**
     * Retrieves a map of product IDs to their corresponding unit prices from the PricebookEntry object.
     * @param allCartProductsId The set of all product IDs in the user's cart.
     * @return A map of product IDs to their corresponding unit prices.
     */
    private static Map<Id,Decimal> getPriceBookMap(Set<Id> allCartProductsId){

        Map<Id,Decimal> pricebookMap     = new Map<Id,Decimal>();
        List<PricebookEntry> pbeList     =       [SELECT
                                                    Product2Id,
                                                    UnitPrice
                                                FROM
                                                    PricebookEntry
                                                WHERE
                                                    Product2Id IN : allCartProductsId
                                                AND
                                                    Pricebook2Id =: pricebookId
                                                WITH
                                                    USER_MODE];


        if(!pbeList.isEmpty()){
            for(PricebookEntry pbeIte    :  pbeList){
                pricebookMap.put(pbeIte.Product2Id,pbeIte.UnitPrice);
            }
        }

        return pricebookMap;
    }


/**
 * Wrapper class for CartItem records, used to expose specific fields for display.
 */


public Class CartItem_Main{

    @AuraEnabled public Decimal gst;
    @AuraEnabled public List<CartItem_Wrapper> cartItems;

}

public Class CartItem_Wrapper{

    @AuraEnabled public String id;
    @AuraEnabled public String proId;
    @AuraEnabled public String proName;
    @AuraEnabled public String proUom;
    @AuraEnabled public String proHsn;
    @AuraEnabled public String description;
    @AuraEnabled public String westCode;
    @AuraEnabled public Decimal qty;
    @AuraEnabled public Decimal gst;
    @AuraEnabled public Decimal price;
    @AuraEnabled public Decimal gstAmt;
    @AuraEnabled public Decimal exeAmt;
    @AuraEnabled public Decimal incAmt;
    @AuraEnabled public Decimal totGstAmt;

    public CartItem_Wrapper(Cart__c cartObj , Decimal unitPrice){


        this.id             = cartObj.id;
        this.proId          = cartObj.Product__c;
        this.proName        = cartObj.Product__r.Name;
        this.proHsn         = cartObj.Product__r.HSN_Code__c;
        this.proUom         = cartObj.Product__r.UOM__c;
        this.description    = cartObj.Product__r.Description;
        this.westCode       = cartObj.Product__r.West_Material_Code__c;
        // this.gst            = cartObj.Product__r.GST__c;
        this.qty            = cartObj.Quantity__c;
        this.price          = unitPrice;
        // this.gstAmt         = (unitPrice / 100) * cartObj.Product__r.GST__c;
        this.exeAmt         = unitPrice * cartObj.Quantity__c;
        this.incAmt         = (unitPrice + this.gstAmt ) * cartObj.Quantity__c;
        this.totGstAmt      = this.gstAmt  * cartObj.Quantity__c;

    }

}

}