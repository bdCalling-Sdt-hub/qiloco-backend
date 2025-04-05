import express, { NextFunction, Request, Response } from 'express';
import { SubscribeController } from './subscribe.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middleware/auth';
const router = express.Router();

router.get('/', auth(USER_ROLES.USER), SubscribeController.getEmail);
router.post('/', auth(USER_ROLES.USER), SubscribeController.subscribe);

export const SubscribeRouter = router;
