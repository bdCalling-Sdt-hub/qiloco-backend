import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
const router = express.Router();
// Create a review
router.post(
  '/:id',
  auth(USER_ROLES.USER),
  validateRequest(ReviewValidation.reviewZodSchema),
  ReviewController.createReview,
);
// Update a review
router.put(
  '/:id',
  auth(USER_ROLES.USER),
  validateRequest(ReviewValidation.updateReviewZodSchema),
  ReviewController.updateReview,
);

// Delete a review
router.delete('/:id', auth(USER_ROLES.USER), ReviewController.deleteReview);

export const ReviewRoutes = router;
