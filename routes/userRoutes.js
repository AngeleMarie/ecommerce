import express from 'express';
import passport from 'passport';
import userController from '../controllers/userAuth.js';
import authenticateToken from '../middlewares/authMiddleware.js'

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login?error=auth' }), (req, res) => {
  res.redirect(`http://localhost:3000/products`); 
});

router.post('/register',userController.registerUser);
router.get('/confirm/:token', userController.confirmEmail);
router.post('/login',  userController.loginUser);
router.get('/logout', authenticateToken, userController.logoutUser);

export default router;