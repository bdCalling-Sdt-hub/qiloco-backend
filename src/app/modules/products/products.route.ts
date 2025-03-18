import express from 'express';
import { ProductController } from './products.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parcseMultipleFileData from '../../middleware/parseMultipleFiledata';

const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  parcseMultipleFileData,
  ProductController.createProduct,
);
router.get('/related', ProductController.findRelatedProduct);
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN),
  ProductController.getAllProducts,
);
router.get('/all', auth(USER_ROLES.USER), ProductController.getAllProductsUser);
router.get(
  '/:id',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.VENDOR,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.USER,
  ),
  ProductController.getProductById,
);
router.put(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  parcseMultipleFileData,
  ProductController.updateProduct,
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN),
  ProductController.deleteProduct,
);

export const ProductRoutes = router;
