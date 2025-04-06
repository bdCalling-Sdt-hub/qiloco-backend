import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Subscribe } from './subscribe.model';

const getEmail = async (email: string) => {
  const isExistEmail = await Subscribe.findOne({ email });
  if (!isExistEmail) {
    return false;
  }
  return true;
};
const saveEmail = async (payload: { email: string }) => {
  const isExistEmail = await Subscribe.findOne({ email: payload.email });
  if (isExistEmail) {
    throw new AppError(StatusCodes.CONFLICT, 'You have alredy subscribed!');
  }
  const result = await Subscribe.create(payload);

  if (!result) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'You can not subscribed to this email',
    );
  }
  return result;
};

export const SubscribeService = {
  getEmail,
  saveEmail,
};
