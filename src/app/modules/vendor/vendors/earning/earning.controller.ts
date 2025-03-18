import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../../../shared/sendResponse';
import catchAsync from '../../../../../utils/catchAsync';
import { EarningService } from './earning.service';

const getEarnings = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await EarningService.earnings(query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Total earning retrieved successfully',
    data: result,
  });
});
const getEarning = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await EarningService.getEarningById(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Earning retrieved successfully',
    data: result,
  });
});
export const EarningController = {
  getEarnings,
  getEarning,
};
