import crypto from 'crypto';
import Authentication from '../models/userModel.js'; 
import authSchema from '../validators/authValidator.js'; 
import transporter from"../config/emailConfig.js"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import Wishlist from '../models/wishListModel.js';
import Cart from '../models/cartModel.js';



const registerUser = async (req, res) => {
    try {
        const { error } = authSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ errors: error.details.map(detail => detail.message) });
        }
        const { fullName, email, phone, password } = req.body;
        let user = await Authentication.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const confirmationToken = crypto.randomBytes(20).toString('hex');
        user = new Authentication({
            fullName,
            email,
            phone,
            password: hashedPassword,
            confirmationToken,
            status: "client",
            isConfirmed: false 
        });
        const wishlist = new Wishlist({ userId: user._id, items: [] });
        const cart = new Cart({ userId: user._id, items: [] });
    
        await wishlist.save();
        await cart.save();

        await user.save();

        const confirmationUrl = `http://localhost:7654/api/v1/users/auth/confirm/${confirmationToken}`;
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Email Confirmation',
            html: `<p>Please confirm your email by clicking the following link: <a href="${confirmationUrl}">${confirmationUrl}</a></p>`
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ error: 'Error sending confirmation email' });
            }
            console.log('Email sent:', info.response);
            res.status(201).json({ message: 'User registered successfully. Please check your email for confirmation.' });
        });

    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


const confirmEmail = async (req, res) => {
    const { token } = req.params;

    try {
        console.log(`Confirmation token received: ${token}`);

        const user = await Authentication.findOne({ confirmationToken: token });

        if (!user) {
            console.error('Invalid or expired confirmation token');
            return res.status(400).json({ error: 'Invalid or expired confirmation token' });
        }
    
        user.isConfirmed = true;
        user.confirmationToken = token;
        await user.save();
        const updatedUser = await Authentication.findById(user._id);
        console.log('Updated user confirmation status:', updatedUser.isConfirmed);

        if (updatedUser.isConfirmed) {
            console.log('Email confirmed successfully');
            return res.redirect('http://localhost:3000/products'); 
        } else {
            console.error('Failed to update confirmation status');
            res.status(500).json({ error: 'Failed to confirm email' });
        }
    } catch (err) {
        console.error('Error confirming email:', err);
        res.status(500).json({ error: 'Server error' });
    }
};



const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body; 
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await Authentication.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check if user role matches
        if (user.role !== role) {
            return res.status(403).json({ error: 'Access denied: insufficient permissions' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).json({ error: 'Server error' });
    }
};




const logoutUser=(req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Error logging out:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ error: 'Server error' });
        }
        res.status(200).json({ message: 'Logout successful' });
      });
    });
  };
  

export default  {
    registerUser,
    confirmEmail,
    loginUser,
    logoutUser
};
