import crypto from 'crypto';
import Authentication from '../models/userModel.js'; 
import authSchema from '../validators/authValidator.js'; 
import transporter from"../config/emailConfig.js"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import Wishlist from '../models/wishListModel.js';
import Cart from '../models/cartModel.js';
import dotenv from 'dotenv'
import cloudinary from 'cloudinary'

dotenv.config()

const registerUser = async (req, res) => {
    try {
        const { error } = authSchema.validateAsync(req.body);
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
            return res.redirect('https://www.agriorgacfarmltd.com/products'); 
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

  const forgotPassword = async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      const verificationCode = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      const user = await Authentication.findOneAndUpdate(
        { email },
        {
          $set: {
            password: hashedPassword,
            resetCode: verificationCode,
            resetCodeExpires: Date.now() + 15 * 60 * 1000, 
          },
        },
        { new: true } 
      );
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Password Reset',
        html: `   <p>Please confirm your password reset. Here is your verification code: <strong>${verificationCode}</strong></p>
    <p>Paste the code in this link: <a href="https://agriorganic-fe.vercel.app/verify">https://agriorganic-fe.vercel.app/verify</a></p>`
      };
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: 'Password reset code sent successfully.' });
    } catch (error) {
      console.error('Error in forgotPassword:', error.message);
      res.status(500).json({ error: 'Failed to send password reset code.' });
    }
  };
// Get a product by ID
export const getUserById = async (req, res) => {
  try {
    const user = await Authentication.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const updatedData = { ...req.body };

    // Upload new image to Cloudinary if provided
    if (req.file && req.file.buffer) {
      const uploadToCloudinary = (buffer) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.v2.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) {
                return reject(error);
              }
              resolve(result.secure_url);
            }
          );
          uploadStream.end(buffer); // Stream the buffer to Cloudinary
        });
      };

      try {
        const pictureUrl = await uploadToCloudinary(req.file.buffer);
        updatedData.profile = pictureUrl; // Update the Cloudinary URL
      } catch (error) {
        console.error("Cloudinary upload error:", error.message);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    // Update the product in the database
    const user = await Authentication.findByIdAndUpdate(userId, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Run validation on the update
    });

    if (!user){
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ error: "An error occurred while updating the product" });
  }
};



  
export default  {
    registerUser,
    confirmEmail,
    loginUser,
    logoutUser,
    forgotPassword,
    updateUser,
    getUserById,

};
