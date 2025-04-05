import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SubscribeService } from './subscribe.service';

const getEmail = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  // Check if the email already exists
  const result = await SubscribeService.getEmail(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Successful retrived email',
    data: {
      subscribed: result,
    },
  });
});
const subscribe = catchAsync(async (req, res) => {
  const data = req.body;
  // Check if the email already exists
  const result = await SubscribeService.saveEmail(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Successfully subscribed!',
    data: result,
  });
});

export const SubscribeController = {
  subscribe,
  getEmail,
};
