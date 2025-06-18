import { Request, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { NotificationService } from './notification.service';
import catchAsync from '../../../utils/catchAsync';

const getNotificationFromDB = catchAsync(async (req, res) => {
     const user: any = req.user;
     const result = await NotificationService.getNotificationFromDB(user);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Notifications Retrieved Successfully',
          data: result,
     });
});

const adminNotificationFromDB = catchAsync(async (req: Request, res: Response) => {
     const result = await NotificationService.adminNotificationFromDB();

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Notifications Retrieved Successfully',
          data: result,
     });
});

const readNotification = catchAsync(async (req, res) => {
     const { id } = req.params;
     const user: any = req.user;
     const result = await NotificationService.readNotificationToDB(user, id);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Notification Read Successfully',
          data: result,
     });
});
const readAllNotification = catchAsync(async (req, res) => {
     const user: any = req.user;
     const result = await NotificationService.readAllNotifications(user);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Notifications Read Successfully',
          data: result,
     });
});

const adminReadNotification = catchAsync(async (req: Request, res: Response) => {
     const result = await NotificationService.adminReadNotificationToDB();

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Notification Read Successfully',
          data: result,
     });
});

export const NotificationController = {
     adminNotificationFromDB,
     getNotificationFromDB,
     readNotification,
     adminReadNotification,
     readAllNotification,
};
