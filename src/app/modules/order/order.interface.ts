import mongoose, { Types } from 'mongoose';

// order.interface.ts
export type OrderStatus = 'pending' | 'processing' | 'delivered' | 'canceled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export interface OrderItem {
     productId: Types.ObjectId;
     sellerId: Types.ObjectId;
     productName: string;
     quantity: number;
     price: number;
     totalPrice: number;
     deliveryStatus?: OrderStatus;
}

export interface IOrder {
     customerId: mongoose.Types.ObjectId;
     sellerId: mongoose.Types.ObjectId;
     orderNumber: string;
     products: OrderItem[];
     totalPrice: number;
     customerName: string;
     email: string;
     phoneNumber: string;
     address: string;
     paymentStatus: PaymentStatus;
     deliveryStatus: OrderStatus;
     checkoutSessionId: string;
     paymentIntentId: string;
}
