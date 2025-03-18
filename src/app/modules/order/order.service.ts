import { StatusCodes } from 'http-status-codes';
import stripe from '../../../config/stripe';
import AppError from '../../../errors/AppError';
import { Order } from './order.model';
import { Product } from '../products/product.model';
import { User } from '../user/user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { OrderStatus, OrderItem } from './order.interface';
import generateOrderNumber from '../../../utils/genarateOrderNumber';
import { Types } from 'mongoose';

interface CartItem {
  productId: Types.ObjectId;
  quantity: number;
}
const createCheckoutSession = async (cartItems: CartItem[], userId: string) => {
  // Check if user exists
  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  const orderItems: OrderItem[] = [];
  const lineItems: Array<{
    price_data?: {
      currency: string;
      product_data: {
        name: string;
        images?: string[];
      };
      unit_amount: number;
    };
    price?: string;
    quantity: number;
  }> = [];

  let totalOrderPrice = 0;

  // Process each item in the cart
  for (const item of cartItems) {
    // Find the product
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        `Product with ID ${item.productId} not found`,
      );
    }

    // Check stock availability
    if (product.quantity < item.quantity) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Product "${product.name}" has only ${product.quantity} items available, but ${item.quantity} requested`,
      );
    }

    // Create line item with inline price_data instead of creating separate products and prices
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          // Images removed to avoid URL validation issues
        },
        unit_amount: Math.round(product.price * 100), // Ensure it's an integer
      },
      quantity: item.quantity,
    });
    // Calculate item total
    const itemTotal = product.price * item.quantity;
    totalOrderPrice += itemTotal;

    // Add to order items
    orderItems.push({
      productId: product._id as Types.ObjectId,
      sellerId: product.userId as Types.ObjectId,
      productName: product.name,
      quantity: item.quantity,
      price: product.price,
      totalPrice: itemTotal,
    });
  }

  // Create the checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: 'https://example.com/success',
    cancel_url: 'https://example.com/cancel',
    line_items: lineItems,
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'BD'],
    },
    metadata: {
      userId: userId.toString(), // Convert ObjectId to string
      orderNumber: generateOrderNumber(),
    },
    phone_number_collection: {
      enabled: true,
    },
  });
  // Create an order in the system
  const order = new Order({
    customerId: userId,
    orderNumber: checkoutSession.metadata?.orderNumber,
    products: orderItems,
    totalPrice: totalOrderPrice,
    customerName: isUserExist.name,
    email: isUserExist.email,
    phoneNumber: isUserExist.phoneNumber || '',
    address: '',
    paymentStatus: 'pending',
    deliveryStatus: 'pending',
    checkoutSessionId: checkoutSession.id,
    paymentIntentId: '',
  });

  // Save the order
  await order.save();
  // Return the URL for the checkout session
  return {
    url: checkoutSession.url,
  };
};

// Get orders by customer
const getCustomerOrders = async (
  customerId: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(
    Order.find({ customerId, paymentStatus: 'paid' }),
    query,
  );
  const orders = await queryBuilder
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.exec();

  const pagination = await queryBuilder.countTotal();
  return { orders, pagination };
};

// Get orders by seller
const getSellerOrders = async (
  sellerId: string,
  query: Record<string, unknown>,
) => {
  // Find orders where this seller has at least one product
  const queryBuilder = new QueryBuilder(
    Order.find({
      'items.sellerId': sellerId,
      paymentStatus: 'paid',
    }),
    query,
  );

  const orders = await queryBuilder
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.exec();

  // For each order, filter to only show items from this seller
  const filteredOrders = orders.map((order) => {
    const sellerItems = order.products.filter(
      (item) => item.sellerId.toString() === sellerId,
    );
    const sellerTotal = sellerItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    return {
      ...order.toObject(),
      items: sellerItems,
      sellerTotal,
    };
  });

  const pagination = await queryBuilder.countTotal();
  return { orders: filteredOrders, pagination };
};

// Get order by ID
const getOrderById = async (id: string) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
  }
  return order;
};

const updateOrderItemStatus = async (id: string, payload: OrderStatus) => {
  const order = await Order.findById(id).select('deliveryStatus');
  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
  }
  const currentStatus = order?.deliveryStatus;

  if (currentStatus === 'canceled') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Order is canceled. No more status changes are allowed',
    );
  }

  if (currentStatus === 'delivered') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Cannot update status. Order is already delivered',
    );
  }

  if (currentStatus === 'pending' && payload !== 'processing') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Order can only be moved from pending to proseccing',
    );
  }
  if (currentStatus === 'processing' && payload !== 'delivered') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Order can only be moved from proseccing to delivered',
    );
  }
  order.deliveryStatus = payload;
  await order.save();
  return order;
};

export const OrderServices = {
  createCheckoutSession,
  getCustomerOrders,
  getSellerOrders,
  getOrderById,
  updateOrderItemStatus,
};
