import express from 'express';
import { EarningController } from './earning.controller';
const router = express.Router();

router.get('/earnings', EarningController.getEarnings);
router.get('/earning/:id', EarningController.getEarning);

export const VendorEarningRoute = router;
