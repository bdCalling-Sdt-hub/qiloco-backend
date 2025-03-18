import { Request, Response } from 'express';
import Stripe from 'stripe';
import colors from 'colors';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../shared/logger';
import config from '../config';
import stripe from '../config/stripe';
import AppError from '../errors/AppError';
import { Order } from '../app/modules/order/order.model';

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
  const session = event.data.object as Stripe.Checkout.Session;
  const paymentIntentId = session.payment_intent as string;
  // Log shipping address to ensure it's being retrieved
  const shippingAddress = session.shipping_details?.address;
  const phone = session.customer_details?.phone as string;
  const isExistOrder = await Order.findOne({
    checkoutSessionId: session.id,
  });
  if (!isExistOrder) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  if (shippingAddress) {
    // Formatting the shipping address string
    const formattedAddress = `${shippingAddress.line1}, ${shippingAddress.line2}, ${shippingAddress.city}, ${shippingAddress.country}`;
    // Update the order fields
    isExistOrder.paymentStatus = 'paid';
    isExistOrder.paymentIntentId = paymentIntentId;
    isExistOrder.phoneNumber = phone;
    isExistOrder.address = formattedAddress;
    // Save the updated order
    await isExistOrder.save();
  } else {
    console.log('Shipping Address is not available');
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
