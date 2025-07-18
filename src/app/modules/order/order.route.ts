import express from 'express';
import { OrderController } from './order.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();
// Route to create a payment intent and order
router.post('/create-chaekout-session', auth(USER_ROLES.USER), OrderController.createOrder);
router.get('/success', OrderController.orderSuccess);
router.get('/cancel', OrderController.orderCancel);
router.get('/', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.VENDOR), OrderController.getOrders);
router.get('/my-orders', auth(USER_ROLES.USER), OrderController.getMyOrders);
router.get('/my-orders/:id', auth(USER_ROLES.USER), OrderController.getMyOrder);
router.get('/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.VENDOR), OrderController.getSingleOrder);
router.patch('/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.VENDOR), OrderController.updateOrderStatus);

export const OrderRoutes = router;
