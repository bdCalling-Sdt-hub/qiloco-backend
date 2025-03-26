import { Request, Response } from 'express';
import Stripe from 'stripe';
import colors from 'colors';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../shared/logger';
import config from '../config';
import stripe from '../config/stripe';
import AppError from '../errors/AppError';
import { Order } from '../app/modules/order/order.model';
import { Product } from '../app/modules/products/product.model';
import { sendNotifications } from './notificationsHelper';

// Handle Stripe Webhook
const handleStripeWebhook = async (req: Request, res: Response) => {
  // Extract Stripe signature and webhook secret
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = config.webhook_secret_key as string;
  const payload = req.body;
  let event: Stripe.Event | undefined;
  // Verify the event signature
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Webhook signature verification failed. ${error}`,
    );
  }

  // Check if the event is valid
  if (!event) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid event received!');
  }

  // Extract event data and type
  const eventType = event.type;

  // Handle the event based on its type
  try {
    switch (eventType) {
      case 'checkout.session.completed':
        await handlePaymentIntentSucceeded(event);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event);
        break;
      default:
        logger.warn(colors.bgGreen.bold(`Unhandled event type: ${eventType}`));
    }
  } catch (error) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Error handling event: ${error}`,
    );
  }
  // Send success response to Stripe
  res.sendStatus(200);
};

const handlePaymentIntentSucceeded = async (event: Stripe.Event) => {
  try {
    const session = event.data.object as Stripe.Checkout.Session;

    if (!session.id) {
      console.error('No session ID found');
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid checkout session');
    }

    const paymentIntentId = session.payment_intent as string;
    const shippingAddress = session.shipping_details?.address;
    const phone = session.customer_details?.phone as string;

    // More robust order finding
    const orders = await Order.find({
      checkoutSessionId: session.id,
    }).lean();

    if (orders.length === 0) {
      console.error('No orders found for session:', session.id);
      throw new AppError(
        StatusCodes.NOT_FOUND,
        'No orders found for this session',
      );
    }

    if (!shippingAddress) {
      console.error('No shipping address available');
      return;
    }

    const formattedAddress = `${shippingAddress.line1}${shippingAddress.line2 ? ', ' + shippingAddress.line2 : ''}, ${shippingAddress.city}, ${shippingAddress.country}`;

    await Promise.all(
      orders.map(async (order) => {
        try {
          const updatedOrder = await Order.findByIdAndUpdate(
            order._id,
            {
              paymentStatus: 'paid',
              paymentIntentId: paymentIntentId,
              phoneNumber: phone,
              address: formattedAddress,
            },
            { new: true },
          );

          // Prepare notification data
          const notificationData = {
            receiver: order.sellerId.toString(),
            title: 'Order Confermatione',
            message: `You have a new order!\nOrder Number: ${order.orderNumber}\nProducts: ${order.products
              .map(
                (product: any) =>
                  `${product.name} (Quantity: ${product.quantity})`,
              )
              .join(
                '\n',
              )}\n\nPlease review the order and prepare for shipment.`,
            type: 'ORDER',
            read: false,
          };

          // Send notification with error handling
          try {
            await sendNotifications(notificationData);
            console.log('Notification sent successfully');
          } catch (notificationError) {
            console.error('Failed to send notification:', notificationError);
          }

          // Update inventory with error handling
          await Promise.all(
            order.products.map(async (product: any) => {
              try {
                const updatedProduct = await Product.findByIdAndUpdate(
                  product.productId,
                  { $inc: { quantity: -product.quantity } },
                  { new: true },
                );
                console.log('Updated Product:', updatedProduct);
              } catch (productUpdateError) {
                console.error(
                  'Failed to update product inventory:',
                  productUpdateError,
                );
              }
            }),
          );
        } catch (orderUpdateError) {
          console.error('Failed to process order:', orderUpdateError);
        }
      }),
    );
  } catch (error) {
    console.error('Overall webhook processing error:', error);
    // Consider sending an error response or logging to a monitoring service
  }
};

// Handle payment failure
const handlePaymentIntentFailed = async (event: Stripe.Event) => {
  const session = event.data.object as Stripe.Checkout.Session;
  const paymentIntentId = session.payment_intent as string;
  const shippingAddress = session.shipping_details?.address;
  const phone = session.customer_details?.phone as string;
  const isExistOrder = await Order.findOne({ checkoutSessionId: session.id });

  if (!isExistOrder) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  isExistOrder.paymentStatus = 'failed';
  isExistOrder.paymentIntentId = paymentIntentId;

  if (shippingAddress) {
    const formattedAddress = `${shippingAddress.line1}, ${shippingAddress.line2}, ${shippingAddress.city}, ${shippingAddress.country}`;
    isExistOrder.address = formattedAddress;
  }

  if (phone) {
    isExistOrder.phoneNumber = phone;
  }

  await isExistOrder.save();

  console.log(`Payment for Order ID ${isExistOrder._id} failed`);
};

export default handleStripeWebhook;
