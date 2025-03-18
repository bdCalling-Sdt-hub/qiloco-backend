import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../../user/user.interface';
import { User } from '../../user/user.model';
import { USER_ROLES } from '../../../../enums/user';

// create  vendor
const createVendorToDB = async (user: JwtPayload, payload: Partial<IUser>) => {
  const isUserExist = await User.findById(user?.id);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'This user does not exist');
  }

  const updatedVendor = await User.findByIdAndUpdate(
    user.id,
    {
      $set: {
        role: USER_ROLES.VENDOR,
        ...payload, // Spread the user details correctly
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedVendor) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create vendor');
  }

  return updatedVendor;
};

export const VendorService = {
  createVendorToDB,
};
