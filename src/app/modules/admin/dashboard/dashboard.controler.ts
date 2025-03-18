import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../../shared/sendResponse';
import catchAsync from '../../../../utils/catchAsync';
import { AdminDashboardService } from './dashboard.service';

// total analysis
const totalAnalysis = catchAsync(async (req, res) => {
  const totalUser = await AdminDashboardService.getTotalUser();
  const totalRevenue = await AdminDashboardService.totalRevenue();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Total analysis retrieved successfully',
    data: {
      totalUser,
      totalRevenue,
    },
  });
});
// Product Seling Overview
const productSelingOverview = catchAsync(async (req, res) => {
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
  const result = await AdminDashboardService.productOverview(yearInt);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product seling overview retrieved successfully',
    data: result,
  });
});
// Earning Overview
const earningOverview = catchAsync(async (req, res) => {
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
  const result = await AdminDashboardService.earningOverviewChart(yearInt);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Earning overview retrieved successfully',
    data: result,
  });
});

const resentSellingProduct = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await AdminDashboardService.resentSellingProduct(query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Resent seling product retrieved successfully',
    data: result,
  });
});
const getSellingProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminDashboardService.getSingleResentProduct(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrieved successfully',
    data: result,
  });
});
export const AdminDashboardController = {
  totalAnalysis,
  productSelingOverview,
  earningOverview,
  resentSellingProduct,
  getSellingProduct,
};
