import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';
import catchAsync from '../../../utils/catchAsync';
import { JwtPayload } from 'jsonwebtoken';

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { ...verifyData } = req.body;
  const result = await AuthService.verifyEmailToDB(verifyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: {
      verifyToken: result.verifyToken,
      accessToken: result.accessToken,
    },
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginUserFromDB(loginData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User logged in successfully.',
    data: {
      token: result.createToken,
    },
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email;
  const result = await AuthService.forgetPasswordToDB(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message:
      'Please check your email. We have sent you a one-time passcode (OTP).',
    data: result,
  });
});
const forgetPasswordByUrl = catchAsync(async (req, res) => {
  const email = req.body.email;

  // Call the service function
  await AuthService.forgetPasswordByUrlToDB(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Please check your email. We have sent you a password reset link.',
    data: {},
  });
});

const resetPasswordByUrl = catchAsync(async (req: Request, res: Response) => {
  let token = req?.headers?.authorization?.split(' ')[1];
  const { ...resetData } = req.body;

  const result = await AuthService.resetPasswordByUrl(token!, resetData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully reset.',
    data: result,
  });
});
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token: any = req.headers.resettoken;
  const { ...resetData } = req.body;
  const result = await AuthService.resetPasswordToDB(token!, resetData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully reset.',
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user: any = req.user;
  const { ...passwordData } = req.body;
  const result = await AuthService.changePasswordToDB(user, passwordData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully changed',
    data: result,
  });
});
// resend Otp
const resendOtp = catchAsync(async (req, res) => {
  const { email } = req.body;
  await AuthService.resendOtpFromDb(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'OTP sent successfully again',
  });
});
export const AuthController = {
  verifyEmail,
  loginUser,
  forgetPassword,
  resetPassword,
  changePassword,
  forgetPasswordByUrl,
  resetPasswordByUrl,
  resendOtp,
};
