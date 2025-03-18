import express from 'express';
import validateRequest from '../../../middleware/validateRequest';
import { VendorController } from './vendor.controller';
import { VendorValidation } from './vendor.validation';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';

const router = express.Router();

router.post(
  '/login',
  // validateRequest(VendorValidation.vendorValidationSchema),
  VendorController.createVendor
);
router.post(
  '/create',
  auth(USER_ROLES.USER),
  validateRequest(VendorValidation.vendorSchema),
  VendorController.createVendor
);

// router.post(
//   '/dashboard/reset-password',
//   auth(USER_ROLES.ADMIN, USER_ROLES.BUSINESSMAN),
//   validateRequest(AuthValidation.createResetPasswordZodSchema),
//   AuthController.resetPasswordByUrl,
// );

export const VendorRouter = router;
