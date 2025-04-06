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
interface OrderMetadata {
  orderNumber: string;
  items: OrderItem[];
  totalPrice: number;
}

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

  // Group cart items by seller
  const itemsBySeller: Record<string, CartItem[]> = {};
  const productDetails: Record<string, any> = {};

  for (const item of cartItems) {
    const product: any = await Product.findById(item.productId);
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

    // Store product details
    productDetails[item.productId.toString()] = product;

    // Group by seller
    const sellerId = product.userId.toString();
    if (!itemsBySeller[sellerId]) {
      itemsBySeller[sellerId] = [];
    }
    itemsBySeller[sellerId].push(item);
  }

  const lineItems = [];
  const ordersBySellerMetadata: Record<string, OrderMetadata>= {};
  let globalOrderNumber = generateOrderNumber();

  // Process each seller's items
  for (const [sellerId, sellerItems] of Object.entries(itemsBySeller)) {
    const sellerOrderItems: OrderItem[] = [];
    let sellerTotalPrice = 0;

    // Process each item for this seller
    for (const item of sellerItems) {
      const product = productDetails[item.productId.toString()];
      const itemTotal = product.price * item.quantity;
      sellerTotalPrice += itemTotal;

      // Add to line items for Stripe
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      });

      // Add to seller's order items
      sellerOrderItems.push({
        productId: product._id as Types.ObjectId,
        sellerId: product.userId as Types.ObjectId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        totalPrice: itemTotal,
      });
    }

    // Store seller order metadata
    const sellerOrderNumber = `${globalOrderNumber}-${sellerId.substring(0, 5)}`;
    ordersBySellerMetadata[sellerId] = {
      orderNumber: sellerOrderNumber,
      items: sellerOrderItems,
      totalPrice: sellerTotalPrice,
    };
  }

  // Create the checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: 'https://2a7c-103-174-189-193.ngrok-free.app',
    cancel_url: 'https://2a7c-103-174-189-193.ngrok-free.app',
    line_items: lineItems,
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'BD'],
    },
    phone_number_collection: {
      enabled: true,
    },
  });

  // Create separate orders for each seller
  for (const [sellerId, orderData] of Object.entries(ordersBySellerMetadata)) {
    const order = new Order({
      customerId: userId,
      orderNumber: orderData.orderNumber,
      products: orderData.items,
      totalPrice: orderData.totalPrice,
      customerName: isUserExist.name,
      email: isUserExist.email,
      phoneNumber: isUserExist.phoneNumber || '',
      address: '',
      paymentStatus: 'pending',
      deliveryStatus: 'pending',
      checkoutSessionId: checkoutSession.id,
      paymentIntentId: '',
      sellerId: sellerId,
    });

    await order.save();
  }

  // Return the URL for the checkout session
  return {
    url: checkoutSession.url,
  };
};

// Get orders by customer
const getCustomerOrders = async (
  sellerId: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(
    Order.find({ sellerId, paymentStatus: 'paid' }),
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
  const queryBuilder = new QueryBuilder(
    Order.find({
      sellerId,
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
      'Order can only be moved from pending to processing',
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

const userOrders = async (
  customerId: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(
    Order.find({
      customerId,
      paymentStatus: 'paid',
    }),
    query,
  );

  const orders = await queryBuilder
    .filter()
    .sort()
    .paginate()
    .fields()
    .modelQuery.populate(
      'products.productId',
      'image quantity quality description productName',
    )
    .exec();

  const pagination = await queryBuilder.countTotal();
  return { orders, pagination };
};
const userSingleOrder = async (id: string) => {
  const order = Order.findById(id).populate(
    'products.productId',
    'image quality description productName',
  );
  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
  }
  return order;
};
export const OrderServices = {
  createCheckoutSession,
  getCustomerOrders,
  getSellerOrders,
  getOrderById,
  updateOrderItemStatus,
  userOrders,
  userSingleOrder,
};
