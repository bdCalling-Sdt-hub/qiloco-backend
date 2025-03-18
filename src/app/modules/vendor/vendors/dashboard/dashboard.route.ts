import express from 'express';
import auth from '../../../../middleware/auth';
import { USER_ROLES } from '../../../../../enums/user';
import { VendorDashboardController } from './dashboard.controller';

const router = express.Router();

// Admin routes go here
router.get(
  '/dashboard',
  auth(USER_ROLES.VENDOR),
  VendorDashboardController.totalAnalysis,
);
router.get(
  '/dashboard/overview',
  auth(USER_ROLES.VENDOR),
  VendorDashboardController.productSelingOverview,
);
router.get(
  '/dashboard/erarming',
  auth(USER_ROLES.VENDOR),
  VendorDashboardController.earningOverview,
);
router.get(
  '/dashboard/products',
  auth(USER_ROLES.VENDOR),
  VendorDashboardController.resentSellingProduct,
);
router.get(
  '/dashboard/products/:id',
  auth(USER_ROLES.VENDOR),
    VendorDashboardController.getSellingProduct,
);
export const VendorDashboardRoute = router;
