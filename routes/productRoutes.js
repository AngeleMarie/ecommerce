// routes/productRoutes.js
import express from 'express';
import multer from "multer";

import { 
  addProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} from '../controllers/product.js';
// import upload from '../config/multerConfig.js';
import authenticateToken from '../middlewares/authMiddleware.js';

const router = express.Router();

const storage=multer.memoryStorage();
const upload=multer({ storage: storage });

router.post('/addProduct' ,upload.single("picture"), addProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/update/:id', upload.single('picture'), updateProduct); // Optional image update
router.delete('/:id',deleteProduct);

export default router;
