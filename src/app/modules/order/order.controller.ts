import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OrderServices } from './order.service';
import stripe from '../../../config/stripe';

// Create a new order
const createOrder = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const { cartItems } = req.body;
     const result = await OrderServices.createCheckoutSession(cartItems, id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Checkout session created successfully',
          data: result,
     });
});
// Create a new order
const getOrders = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const query = req.query;
     const result = await OrderServices.getCustomerOrders(id, query);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Orders retrieved successfully',
          data: result,
     });
});
const getSingleOrder = catchAsync(async (req, res) => {
     const { id } = req.params;
     const result = await OrderServices.getOrderById(id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Order retrieved successfully',
          data: result,
     });
});
// update order status
const updateOrderStatus = catchAsync(async (req, res) => {
     const { id } = req.params;
     const { status } = req.body;
     const result = await OrderServices.updateOrderItemStatus(id, status);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Order status updated successfully',
          data: result,
     });
});

// get my orders
const getMyOrders = catchAsync(async (req, res) => {
     const { id }: any = req.user;
     const result = await OrderServices.userOrders(id, req.query);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Order retrieved successfully',
          data: result,
     });
});
// get my order
const getMyOrder = catchAsync(async (req, res) => {
     const { id } = req.params;
     const result = await OrderServices.userSingleOrder(id);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Order retrieved successfully',
          data: result,
     });
});

// Assuming you have OrderServices imported properly
const orderSuccess = catchAsync(async (req, res) => {
     const sessionId = req.query.session_id as string;
     const session = await OrderServices.successMessage(sessionId);
     res.render('success', { session });
});
// Assuming you have OrderServices imported properly
const orderCancel = catchAsync(async (req, res) => {
     res.render('cancel');
});
export const OrderController = {
     createOrder,
     getOrders,
     getSingleOrder,
     updateOrderStatus,
     getMyOrders,
     getMyOrder,
     orderSuccess,
     orderCancel,
};
