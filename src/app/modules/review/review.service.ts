import { StatusCodes } from 'http-status-codes';
import { IReview } from '../products/product.interface';
import { Product } from '../products/product.model';
import AppError from '../../../errors/AppError';
import { ObjectId } from 'mongoose';

// Helper function to find product
const findProductById = async (productId: string) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }
  return product;
};

// Create a review
const createReviewToDB = async (
  payload: IReview,
  userId: ObjectId,
  productId: string,
) => {
  const { rating, comment } = payload;

  const product = await findProductById(productId);

  // Check if the user has already reviewed the product
  const existingReview = product.reviews.find(
    (review) => review.userId.toString() === userId.toString(),
  );

  if (existingReview) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'You have already reviewed this product',
    );
  }

  const newReview = {
    userId,
    rating,
    comment,
    date: new Date(),
  };

  product.reviews.push(newReview);
  await product.save();

  return newReview;
};

// Update a review
// Update a review
const updateReviewInDB = async (
  payload: IReview,
  userId: ObjectId,
  productId: string,
) => {
  const { rating, comment } = payload;

  const product = await findProductById(productId);

  // Find the review to update
  const reviewIndex = product.reviews.findIndex(
    (review) => review.userId.toString() === userId.toString(),
  );

  if (reviewIndex === -1) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  // Update the review
  const updatedReview = {
    ...product.reviews[reviewIndex],
    rating,
    comment,
    userId: userId,
    date: new Date(),
  };

  product.reviews[reviewIndex] = updatedReview;
  await product.save();

  return updatedReview;
};

// Delete a review
const deleteReviewFromDB = async (userId: string, productId: string) => {
  const product = await findProductById(productId);

  // Find the review to delete
  const reviewIndex = product.reviews.findIndex(
    (review) => review.userId.toString() === userId,
  );

  if (reviewIndex === -1) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  // Remove the review from the array
  product.reviews.splice(reviewIndex, 1);

  await product.save();

  return { message: 'Review deleted successfully' };
};

export const ReviewService = {
  createReviewToDB,
  updateReviewInDB,
  deleteReviewFromDB,
};
