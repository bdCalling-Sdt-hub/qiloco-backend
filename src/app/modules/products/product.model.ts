import mongoose, { Schema, model } from 'mongoose';
import { IProduct } from './product.interface';

// Review Schema embedded inside the Product Schema
const reviewSchema = new Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    quality: { type: String, enum: ['high', 'medium'], required: true },
    quantity: { type: Number, required: true },
    moodTag: { type: [String], required: true },
    potency: { type: String, required: true },
    genetics: { type: String, required: true },
    origin: { type: String, required: true },
    type: { type: String, required: true },
    scent: { type: String, required: true },
    image: { type: [String], default: [] },
    isDeleted: { type: Boolean, required: false },
    reviews: { type: [reviewSchema], default: [] }, 
  },
  { timestamps: true },
);

productSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

productSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

productSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

// Virtual field to calculate the total number of reviews
productSchema.virtual('totalRatings').get(function () {
  return this.reviews?.length;
});

// Virtual field to calculate the average rating
productSchema.virtual('averageRating').get(function () {
  if (this.reviews?.length === 0) {
    return 0;
  }

  const total = this.reviews?.reduce((acc, review) => acc + review.rating, 0);
  return total / this.reviews?.length;
});

// Ensure virtuals are included in the output of queries
productSchema.set('toJSON', {
  virtuals: true,
});

export const Product = model<IProduct>('Product', productSchema);
