import express from 'express';
import wishlistController from '../controllers/wishlist.js';
import authenticateToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/add', authenticateToken, wishlistController.addItemToWishlist);
router.get('/:userId', authenticateToken, wishlistController.getWishlist);
router.delete('/delete', authenticateToken, wishlistController.removeItemFromWishlist);

export default router;
