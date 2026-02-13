import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface CardListing {
    status: ListingStatus;
    title: string;
    listingId: string;
    createdAt: Time;
    description: string;
    seller: Principal;
    imageUrl: string;
    price: bigint;
    condition: CardCondition;
}
export interface UserProfile {
    name: string;
    email?: string;
}
export interface OrderRequest {
    status: OrderStatus;
    listingId: string;
    createdAt: Time;
    orderId: string;
    offerPrice?: bigint;
    message?: string;
    buyer: Principal;
}
export enum CardCondition {
    fair = "fair",
    good = "good",
    mint = "mint",
    poor = "poor",
    near_mint = "near_mint"
}
export enum ListingStatus {
    active = "active",
    expired = "expired",
    sold = "sold"
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    rejected = "rejected",
    accepted = "accepted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(listingId: string, title: string, description: string, price: bigint, condition: CardCondition, imageUrl: string): Promise<void>;
    createOrderRequest(orderId: string, listingId: string, offerPrice: bigint | null, message: string | null): Promise<void>;
    getActiveListings(): Promise<Array<CardListing>>;
    getBuyerOrderRequests(buyer: Principal): Promise<Array<OrderRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListingsSortedByCreatedAt(): Promise<Array<CardListing>>;
    getListingsSortedByPrice(): Promise<Array<CardListing>>;
    getOrderRequestsSortedByCreatedAt(): Promise<Array<OrderRequest>>;
    getSellerListings(seller: Principal): Promise<Array<CardListing>>;
    getSellerOrderRequests(seller: Principal): Promise<Array<OrderRequest>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markListingSold(listingId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateOrderRequestStatus(orderId: string, status: OrderStatus): Promise<void>;
}
