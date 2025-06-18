import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
export interface IUser {
     _id: string;
     name: string;
     role: USER_ROLES;
     email: string;
     password: string;
     image?: string;
     status: 'active' | 'blocked';
     verified: boolean;
     isDeleted: boolean;
     userName?: string;
     phoneNumber: string;
     contactNumber?: string;
     company?: string;
     country?: string;
     address?: {
          street?: string;
          city?: string;
          state?: string;
          postcode?: string;
          country?: string;
     };
     authentication?: {
          isResetPassword: boolean;
          oneTimeCode?: number | null;
          expireAt?: Date | null;
     };
}
export type UserModel = {
     isExistUserById(id: string): any;
     isExistUserByEmail(email: string): any;
     isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
