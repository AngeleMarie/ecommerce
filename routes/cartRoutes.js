// routes/cart.js
import express from 'express';
import cartController from '../controllers/cart.js';
import authenticateToken from '../middlewares/authMiddleware.js';

const router = express.Router();

// Define cart endpoints
router.post('/add', authenticateToken, cartController.addItemToCart);
router.get('/:userId', authenticateToken, cartController.getCart);
router.delete('/delete', authenticateToken, cartController.removeItemFromCart);

export default router;
