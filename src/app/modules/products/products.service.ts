import { Product } from './product.model';
import { IProduct } from './product.interface';
import AppError from '../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';

// create Product
const createProduct = async (payload: IProduct) => {
  const result = await Product.create(payload);
  if (!result) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to create product',
    );
  }
  return result;
};
// get all product for vendor and admin users
const getAllProducts = async (id: string, query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(Product.find({ userId: id }), query);

  const products = await queryBuilder.filter().sort().paginate().fields()
    .modelQuery;

  if (!products || products.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }
  const meta = await queryBuilder.countTotal();
  return { products, meta };
};
// get all product for users
const getAllProductsUser = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(Product.find({}), query);
  if (query.moodTag) {
    const moodTags = Array.isArray(query.moodTag)
      ? query.moodTag
      : (query.moodTag as string).split(',');
    queryBuilder.filterByMoodTag(moodTags);
  }
  const products = await queryBuilder.filter().sort().paginate().fields()
    .modelQuery;
  const meta = await queryBuilder.countTotal();
  return { products, meta };
};

// get product by id
const getProductById = async (id: string) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }
  return product;
};

// update product by vendor and admin
const updateProduct = async (
  userId: string,
  id: string,
  updateData: Partial<IProduct>,
) => {
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: id, userId: userId },
    updateData,
    { new: true, runValidators: true },
  );

  if (!updatedProduct) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Product not found or not authorized to update',
    );
  }

  return updatedProduct;
};

// delete product by vendor and the admin
const deleteProduct = async (id: string, productId: string) => {
  const product = await Product.findOneAndUpdate(
    { _id: productId, userId: id },
    {
      $set: { isDeleted: true },
    },
    { new: true },
  );

  if (!product) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Product not found or not authorized to delete',
    );
  }

  return product;
};
// Find related products by matching type
const findRelatedProducts = async (type: string) => {
  const relatedProducts = await Product.find({ type }).limit(10);
  if (!relatedProducts) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No related products found');
  }
  return relatedProducts;
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProductsUser,
  findRelatedProducts,
};
