import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../../../shared/sendResponse';
import catchAsync from '../../../../../utils/catchAsync';
import { VendorDashboardService } from './dashboard.service';

// total analysis
const totalAnalysis = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const totalSell = await VendorDashboardService.getTotalSell(id);
  const totalOrder = await VendorDashboardService.getTotalOrder(id);
  const totalEarning = await VendorDashboardService.getTotalEarning(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Total analysis retrieved successfully',
    data: {
      totalSell,
      totalOrder,
      totalEarning,
    },
  });
});
// Product Seling Overview
const productSelingOverview = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const { year } = req.query;
  if (!year) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Year is required',
    });
  }
  // Convert the year to a number
  const yearInt = parseInt(year as string);
  const result = await VendorDashboardService.orderOverview(yearInt, id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product seling overview retrieved successfully',
    data: result,
  });
});
// Earning Overview
const earningOverview = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const { year } = req.query;
  if (!year) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Year is required',
    });
  }

  // Convert the year to a number
  const yearInt = parseInt(year as string);
  const result = await VendorDashboardService.earningOverviewChart(yearInt, id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Earning overview retrieved successfully',
    data: result,
  });
});

const resentSellingProduct = catchAsync(async (req, res) => {
  const query = req.query;
  const { id }: any = req.user;
  const result = await VendorDashboardService.resentSellingProduct(query, id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Resent seling product retrieved successfully',
    data: result,
  });
});
const getSellingProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await VendorDashboardService.getSingleResentProduct(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrieved successfully',
    data: result,
  });
});

export const VendorDashboardController = {
  productSelingOverview,
  totalAnalysis,
  earningOverview,
  resentSellingProduct,
  getSellingProduct
};
