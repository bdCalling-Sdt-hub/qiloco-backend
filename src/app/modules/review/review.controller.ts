import { Request, Response } from 'express';
import { ReviewService } from './review.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../utils/catchAsync';

// Create a review
const createReview = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const productId = req.params.id;
  const result = await ReviewService.createReviewToDB(req.body, id, productId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review Created Successfully',
    data: result,
  });
});

// Update a review
const updateReview = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const productId = req.params.id;
  const result = await ReviewService.updateReviewInDB(req.body, id, productId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review Updated Successfully',
    data: {
      userId: result.userId,
      rating: result.rating,
      comment: result.comment,
      date: result.date,
    },
  });
});

// Delete a review
const deleteReview = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const productId = req.params.id;
  const result = await ReviewService.deleteReviewFromDB(id, productId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
  });
});

export const ReviewController = { createReview, updateReview, deleteReview };
