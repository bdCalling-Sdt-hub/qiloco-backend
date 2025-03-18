import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../../shared/sendResponse';
import { VendorService } from './vendor.service';
import catchAsync from '../../../../utils/catchAsync';


const createVendor = catchAsync(async (req, res) => {
  const user:any = req.user;
  const { ...userData } = req.body;
  const result = await VendorService.createVendorToDB(user, userData);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Vendor created successfully',
    data: result,
  });
})

export const VendorController = {
  createVendor,
};
