import { StatusCodes } from 'http-status-codes';
import { Product } from '../products/product.model';
import AppError from '../../../errors/AppError';
import mongoose from 'mongoose';

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
  payload: any,
  userId: any,
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
  payload: any,
  userId: any,
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
const getProductReviewStats = async (productId: string) => {
  // Aggregation to get reviews by rating
  const product = await Product.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(productId) }, 
    },
    {
      $unwind: '$reviews', // Unwind reviews array
    },
    {
      $group: {
        _id: '$reviews.rating', // Group by the rating value
        count: { $sum: 1 }, // Count number of reviews for each rating
      },
    },
    {
      $sort: { _id: 1 }, // Sort by rating in ascending order
    },
  ]);

  // Debugging the result of aggregation
  console.log(product);

  if (!product || product.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No reviews found for the product');
  }

  // Calculate the total count of reviews
  const totalReviews = product.reduce(
    (sum: number, item: any) => sum + item.count,
    0,
  );

  // Calculate the average rating
  const averageRating =
    product.reduce((sum: number, item: any) => sum + item._id * item.count, 0) /
    totalReviews;

  // Prepare the result with ratings distribution
  const ratingsDistribution: { [key in '1' | '2' | '3' | '4' | '5']: number } = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
  };

  // Distribute the counts of each rating to corresponding keys
  product.forEach((item: any) => {
    const ratingKey = item._id.toString() as '1' | '2' | '3' | '4' | '5';
    ratingsDistribution[ratingKey] = item.count;
  });

  return {
    averageRating,
    totalReviews,
    ratingsDistribution,
  };
};




export const ReviewService = {
  createReviewToDB,
  updateReviewInDB,
  deleteReviewFromDB,
  getProductReviewStats
};
