import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OrderServices } from './order.service';

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

export const OrderController = {
  createOrder,
  getOrders,
  getSingleOrder,
  updateOrderStatus,
};
