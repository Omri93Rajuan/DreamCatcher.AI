import { IProduct } from "./product.interface";
export enum OrderStatus {
    Pending = "pending",
    Paid = "paid",
    Shipped = "shipped",
    Delivered = "delivered"
}
export enum PaymentMethod {
    Wallet = "wallet",
    CreditCard = "credit_card",
    PayPal = "paypal",
    CashOnDelivery = "cash_on_delivery"
}
export enum PaymentStatus {
    Pending = "pending",
    Completed = "completed",
    Failed = "failed",
    Refunded = "refunded"
}
export interface IOrder {
    _id?: string;
    user: string;
    products: {
        product: string | IProduct;
        quantity: number;
        price: number;
    }[];
    totalPrice: number;
    status?: OrderStatus;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    shippingAddress?: string;
    trackingNumber?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
