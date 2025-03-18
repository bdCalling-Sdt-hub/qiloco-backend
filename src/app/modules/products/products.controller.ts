import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../utils/catchAsync';
import { ProductService } from './products.service';

const createProduct = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const productData = {
    ...req.body,
    userId: id,
  };
  const result = await ProductService.createProduct(productData);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Product created successfully',
    data: result,
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const query = req.query;
  const result = await ProductService.getAllProducts(id, query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Products retrieved successfully',
    data: { products: result.products, meta: result.meta },
  });
});
const getAllProductsUser = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const query = req.query;
  const result = await ProductService.getAllProductsUser(query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Products retrieved successfully',
    data: { products: result.products, meta: result.meta },
  });
});

const getProductById = catchAsync(async (req, res) => {
  const productId = req.params.id;
  const result = await ProductService.getProductById(productId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product retrieved successfully',
    data: result,
  });
});

const updateProduct = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const productId = req.params.id;
  const updateData = req.body;
  const result = await ProductService.updateProduct(id, productId, updateData);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product updated successfully',
    data: result,
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const productId = req.params.id;
  await ProductService.deleteProduct(id, productId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Product deleted successfully',
  });
});

const findRelatedProduct = catchAsync(async (req, res) => {
  const { type }: any = req.query;
  const result = await ProductService.findRelatedProducts(type);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Related products retrieved successfully',
    data: result,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProductsUser,
  findRelatedProduct,
};
