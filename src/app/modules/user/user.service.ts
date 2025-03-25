import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import unlinkFile from '../../../shared/unlinkFile';
import { IUser } from './user.interface';
import { User } from './user.model';
import AppError from '../../../errors/AppError';
import { USER_ROLES } from '../../../enums/user';
import generateOTP from '../../../utils/generateOTP';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';
// create user
const createUserToDB = async (payload: IUser): Promise<IUser> => {
  //set role
  const user = await User.isExistUserByEmail(payload.email);
  if (user) {
    throw new AppError(StatusCodes.CONFLICT, 'Email already exists');
  }
  payload.role = USER_ROLES.USER;
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP(4);
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } },
  );

  return createUser;
};

// create Admin
// const createAdminToDB = async (
//   payload: Partial<IUser>
// ): Promise<IUser> => {
//   //set role
//   payload.role = USER_ROLES.ADMIN;
//   const createAdmin = await User.create(payload);
//   if (!createAdmin) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create admin');
//   }

//   //send email
//   const otp = generateOTP(6);
//   const values = {
//     name: createAdmin.name,
//     otp: otp,
//     email: createAdmin.email!,
//   };
//   const createAccountTemplate = emailTemplate.createAccount(values);
//   emailHelper.sendEmail(createAccountTemplate);

//   //save to DB
//   const authentication = {
//     oneTimeCode: otp,
//     expireAt: new Date(Date.now() + 3 * 60000),
//   };
//   await User.findOneAndUpdate(
//     { _id: createAdmin._id },
//     { $set: { authentication } }
//   );

//   return createAdmin;
// };

const getUserProfileFromDB = async (
  user: JwtPayload,
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Define role-specific fields to return
  let profileData: Partial<IUser>;

  switch (isExistUser.role) {
    case USER_ROLES.SUPER_ADMIN:
      // Super admin sees all information
      profileData = isExistUser;
      break;

    case USER_ROLES.ADMIN:
      // Admin profile data - can see most things but maybe not all super admin data
      profileData = {
        _id: isExistUser._id,
        name: isExistUser.name,
        email: isExistUser.email,
        role: isExistUser.role,
        image: isExistUser.image,
        status: isExistUser.status,
        verified: isExistUser.verified,
        userName: isExistUser.userName,
        phoneNumber: isExistUser.phoneNumber,
        company: isExistUser.company,
        country: isExistUser.country,
        address: isExistUser.address,
      };
      break;

    case USER_ROLES.VENDOR:
      // Vendor-specific profile data
      profileData = {
        _id: isExistUser._id,
        name: isExistUser.name,
        email: isExistUser.email,
        role: isExistUser.role,
        image: isExistUser.image,
        status: isExistUser.status,
        verified: isExistUser.verified,
        userName: isExistUser.userName,
        phoneNumber: isExistUser.phoneNumber,
        company: isExistUser.company,
        country: isExistUser.country,
        address: isExistUser.address,
      };
      break;

    case USER_ROLES.USER:
      // Regular user profile data - limited information
      profileData = {
        _id: isExistUser._id,
        name: isExistUser.name,
        email: isExistUser.email,
        role: isExistUser.role,
        image: isExistUser.image,
        verified: isExistUser.verified,
        phoneNumber: isExistUser.phoneNumber,
      };
      break;

    default:
      // Default case for any unexpected roles
      profileData = {
        _id: isExistUser._id,
        name: isExistUser.name,
        email: isExistUser.email,
        role: isExistUser.role,
        verified: isExistUser.verified,
      };
  }

  return profileData;
};
// update user profile
const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image && isExistUser.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const verifyUserPassword = async (userId: string, password: string) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
  }
  const isPasswordValid = await User.isMatchPassword(password, user.password);
  return isPasswordValid;
};
const deleteUser = async (id: string) => {
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  await User.findByIdAndUpdate(id, {
    $set: { isDeleted: true },
  });

  return true;
};
export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  deleteUser,
  verifyUserPassword,
};
