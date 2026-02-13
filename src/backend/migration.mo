import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";

module {
  type UserProfile = {
    name : Text;
    email : ?Text;
  };

  type OldCardListing = {
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

  type CardCondition = {
    #mint;
    #near_mint;
    #good;
    #fair;
    #poor;
  };

  type ListingStatus = {
    #active;
    #sold;
    #expired;
  };

  type OldOrderRequest = {
    orderId : Text;
    listingId : Text;
    buyer : Principal;
    status : OrderStatus;
    createdAt : Time.Time;
  };

  type OrderStatus = {
    #pending;
    #accepted;
    #rejected;
    #cancelled;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    listings : Map.Map<Text, OldCardListing>;
    orderRequests : Map.Map<Text, OldOrderRequest>;
  };

  type NewCardListing = OldCardListing;

  type NewOrderRequest = {
    orderId : Text;
    listingId : Text;
    buyer : Principal;
    status : OrderStatus;
    offerPrice : ?Nat;
    message : ?Text;
    createdAt : Time.Time;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    listings : Map.Map<Text, NewCardListing>;
    orderRequests : Map.Map<Text, NewOrderRequest>;
  };

  public func run(old : OldActor) : NewActor {
    let newOrderRequests = old.orderRequests.map<Text, OldOrderRequest, NewOrderRequest>(
      func(_id, oldOrder) {
        { oldOrder with offerPrice = null; message = null };
      }
    );
    { old with orderRequests = newOrderRequests };
  };
};
