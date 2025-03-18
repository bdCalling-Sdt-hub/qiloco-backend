import express from 'express';
import { AdminDashboardController } from './dashboard.controler';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';

const router = express.Router();

// Admin routes go here
router.get(
  '/dashboard',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminDashboardController.totalAnalysis,
);
router.get(
  '/dashboard/overview',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminDashboardController.productSelingOverview,
);
router.get(
  '/dashboard/erarming',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminDashboardController.earningOverview,
);
router.get(
  '/dashboard/products',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminDashboardController.resentSellingProduct,
);
router.get(
  '/dashboard/products/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdminDashboardController.getSellingProduct,
);
export const AdminDashboardRoute = router;
