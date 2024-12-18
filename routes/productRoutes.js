import express from 'express';
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

router.post('/addProduct', upload.single('picture'), addProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/update/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
