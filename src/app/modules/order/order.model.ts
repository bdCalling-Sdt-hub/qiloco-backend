// order.model.ts
import { Schema, model } from 'mongoose';
import { IOrder } from './order.interface';

const orderItemSchema = new Schema({
     productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
     },
     sellerId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
     },
     productName: {
          type: String,
          required: true,
     },
     quantity: {
          type: Number,
          required: true,
          min: 1,
     },
     price: {
          type: Number,
          required: true,
          min: 0,
     },
     totalPrice: {
          type: Number,
          required: true,
          min: 0,
     },
});

const orderSchema = new Schema<IOrder>(
     {
          customerId: {
               type: Schema.Types.ObjectId,
               ref: 'User',
               required: true,
          },
          sellerId: {
               type: Schema.Types.ObjectId,
               ref: 'User',
               required: true,
          },
          orderNumber: {
               type: String,
               required: true,
               unique: true,
          },
          products: {
               type: [orderItemSchema],
               required: true,
          },
          totalPrice: {
               type: Number,
               required: true,
               min: 0,
          },
          customerName: {
               type: String,
               required: true,
          },
          email: {
               type: String,
               required: true,
          },
          phoneNumber: {
               type: String,
               required: false,
          },
          address: {
               type: String,
               required: false,
          },
          paymentStatus: {
               type: String,
               enum: ['pending', 'paid', 'refunded', 'failed'],
               default: 'pending',
          },
          deliveryStatus: {
               type: String,
               enum: ['pending', 'processing', 'delivered', 'canceled'],
               default: 'pending',
          },
          checkoutSessionId: {
               type: String,
               required: true,
          },
          paymentIntentId: {
               type: String,
               required: false,
          },
     },
     {
          timestamps: true,
     },
);

export const Order = model<IOrder>('Order', orderSchema);
