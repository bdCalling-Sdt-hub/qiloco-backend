import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import { settingsService } from './sattings.service';
import catchAsync from '../../../utils/catchAsync';

const addSetting = catchAsync(async (req, res) => {
     const result = await settingsService.upsertSettings(req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Setting added successfully',
          data: result,
     });
});

const getSettings = catchAsync(async (req, res): Promise<void> => {
     const result = await settingsService.getSettings(req.query.title as string);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Setting get successfully',
          data: result,
     });
});

const getPrivacyPolicy = catchAsync(async (req, res): Promise<void> => {
     const htmlContent = await settingsService.getPrivacyPolicy();
     res.sendFile(htmlContent);
});

const getAccountDelete = catchAsync(async (req, res): Promise<void> => {
     const htmlContent = await settingsService.getAccountDelete();
     res.sendFile(htmlContent);
});

const getSupport = catchAsync(async (req, res): Promise<void> => {
     const htmlContent = await settingsService.getSupport();
     res.sendFile(htmlContent);
});

const updateSetting = catchAsync(async (req, res) => {
     //   const { id } = req.params;
     const settingData = { ...req.body };
     const result = await settingsService.updateSettings(settingData);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Setting update successfully',
          data: result,
     });
});

export const settingsController = {
     addSetting,
     getSettings,
     getPrivacyPolicy,
     getAccountDelete,
     getSupport,
     updateSetting,
};
