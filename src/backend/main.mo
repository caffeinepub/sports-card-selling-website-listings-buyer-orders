import Migration "migration";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Apply migration from migration.mo file below
(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public type UserProfile = {
    name : Text;
    email : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  module CardListing {
    public type ListingStatus = {
      #active;
      #sold;
      #expired;
    };

    public type CardListing = {
      listingId : Text;
      title : Text;
      description : Text;
      price : Nat;
      condition : CardCondition;
      imageUrl : Text;
      seller : Principal;
      status : ListingStatus;
      createdAt : Time.Time;
    };

    public type CardCondition = {
      #mint;
      #near_mint;
      #good;
      #fair;
      #poor;
    };

    public func compareByPrice(listing1 : CardListing, listing2 : CardListing) : Order.Order {
      Nat.compare(listing1.price, listing2.price);
    };

    public func compareByCreatedAt(listing1 : CardListing, listing2 : CardListing) : Order.Order {
      Int.compare(listing1.createdAt, listing2.createdAt);
    };
  };

  type CardListing = CardListing.CardListing;
  type CardCondition = CardListing.CardCondition;
  type ListingStatus = CardListing.ListingStatus;

  module OrderRequest {
    public type OrderStatus = {
      #pending;
      #accepted;
      #rejected;
      #cancelled;
    };

    public type OrderRequest = {
      orderId : Text;
      listingId : Text;
      buyer : Principal;
      status : OrderStatus;
      offerPrice : ?Nat;
      message : ?Text;
      createdAt : Time.Time;
    };

    public func compareByCreatedAt(order1 : OrderRequest, order2 : OrderRequest) : Order.Order {
      Int.compare(order1.createdAt, order2.createdAt);
    };
  };

  type OrderRequest = OrderRequest.OrderRequest;
  type OrderStatus = OrderRequest.OrderStatus;

  let listings = Map.empty<Text, CardListing>();
  let orderRequests = Map.empty<Text, OrderRequest>();

  // Card Listing Management

  public shared ({ caller }) func createListing(
    listingId : Text,
    title : Text,
    description : Text,
    price : Nat,
    condition : CardCondition,
    imageUrl : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };

    let newListing : CardListing = {
      listingId;
      title;
      description;
      price;
      condition;
      imageUrl;
      seller = caller;
      status = #active;
      createdAt = Time.now();
    };

    listings.add(listingId, newListing);
  };

  public shared ({ caller }) func markListingSold(listingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark listings as sold");
    };

    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.seller != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the listing owner or admin can mark as sold");
        };
        let updatedListing : CardListing = {
          listing with status = #sold
        };
        listings.add(listingId, updatedListing);
      };
    };
  };

  public query ({ caller }) func getActiveListings() : async [CardListing] {
    listings.values().toArray().filter(
      func(l) { l.status == #active }
    );
  };

  public query ({ caller }) func getSellerListings(seller : Principal) : async [CardListing] {
    if (caller != seller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own listings");
    };
    listings.values().toArray().filter(
      func(l) { l.seller == seller }
    );
  };

  public query ({ caller }) func getListingsSortedByPrice() : async [CardListing] {
    listings.values().toArray().sort(CardListing.compareByPrice);
  };

  public query ({ caller }) func getListingsSortedByCreatedAt() : async [CardListing] {
    listings.values().toArray().sort(CardListing.compareByCreatedAt);
  };

  // Order Request Management

  // Updated createOrderRequest function with optional offerPrice and message
  public shared ({ caller }) func createOrderRequest(
    orderId : Text,
    listingId : Text,
    offerPrice : ?Nat,
    message : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create order requests");
    };

    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.seller == caller) {
          Runtime.trap("Sellers cannot create order requests on their own listings");
        };
        if (listing.status != #active) {
          Runtime.trap("Cannot create order request for inactive listing");
        };
        let newOrderRequest : OrderRequest = {
          orderId;
          listingId;
          buyer = caller;
          status = #pending;
          offerPrice;
          message;
          createdAt = Time.now();
        };
        orderRequests.add(orderId, newOrderRequest);
      };
    };
  };

  public shared ({ caller }) func updateOrderRequestStatus(orderId : Text, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update order request status");
    };

    switch (orderRequests.get(orderId)) {
      case (null) { Runtime.trap("Order request not found") };
      case (?order) {
        switch (listings.get(order.listingId)) {
          case (null) { Runtime.trap("Associated listing not found") };
          case (?listing) {
            let isSeller = listing.seller == caller;
            let isBuyer = order.buyer == caller;
            let isAdmin = AccessControl.isAdmin(accessControlState, caller);

            if (not (isSeller or isBuyer or isAdmin)) {
              Runtime.trap("Unauthorized: Only the seller, buyer, or admin can update order status");
            };

            // Buyers can only cancel their own orders
            if (isBuyer and not isSeller and not isAdmin) {
              if (status != #cancelled) {
                Runtime.trap("Unauthorized: Buyers can only cancel orders");
              };
            };

            // Sellers can accept or reject orders for their listings
            if (isSeller and not isAdmin) {
              if (status != #accepted and status != #rejected) {
                Runtime.trap("Unauthorized: Sellers can only accept or reject orders");
              };
            };

            let updatedOrder : OrderRequest = {
              order with status
            };
            orderRequests.add(orderId, updatedOrder);
          };
        };
      };
    };
  };

  public query ({ caller }) func getSellerOrderRequests(seller : Principal) : async [OrderRequest] {
    if (caller != seller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own order requests");
    };

    let sellerListings = listings.values().toArray().filter(
      func(l) { l.seller == seller }
    );

    let sellerListingIds = sellerListings.map(
      func(l) { l.listingId }
    );

    orderRequests.values().toArray().filter(
      func(o) {
        sellerListingIds.find(
          func(id) { id == o.listingId }
        ) != null;
      }
    );
  };

  public query ({ caller }) func getBuyerOrderRequests(buyer : Principal) : async [OrderRequest] {
    if (caller != buyer and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own order requests");
    };
    orderRequests.values().toArray().filter(
      func(o) { o.buyer == buyer }
    );
  };

  public query ({ caller }) func getOrderRequestsSortedByCreatedAt() : async [OrderRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all order requests");
    };
    orderRequests.values().toArray().sort(OrderRequest.compareByCreatedAt);
  };
};
