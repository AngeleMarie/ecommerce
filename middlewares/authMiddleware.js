import jwt from 'jsonwebtoken';
import Authentication from '../models/userModel.js'; 
import cloudinary from 'cloudinary';

// Middleware to authenticate token and attach user to request
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.sendStatus(403); // Forbidden
        }

        try {
            const user = await Authentication.findById(decoded.id);

            if (!user) {
                console.error('User not found for ID:', decoded.id);
                return res.sendStatus(404); // User not found
            }

            if (!user.isConfirmed) {
                return res.status(403).json({ error: 'Email not confirmed' }); // Forbidden
            }

            req.user = user; // Attach user to request
            next();
        } catch (error) {
            console.error('Error fetching user:', error.message);
            res.status(500).json({ error: 'An error occurred during authentication' });
        }
    });
};

// Controller to update user information
export const updateUser = async (req, res) => {
    try {
        const userId = req.user._id; // Extract user ID from authenticated request
        const updatedData = { ...req.body };

        // Upload new image to Cloudinary if provided
        if (req.file && req.file.buffer) {
            const uploadToCloudinary = (buffer) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.v2.uploader.upload_stream(
                        { folder: "users" },
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

        // Update the user in the database
        const user = await Authentication.findByIdAndUpdate(userId, updatedData, {
            new: true, // Return the updated document
            runValidators: true, // Run validation on the update
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "User updated successfully",
            user,
        });
    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).json({ error: "An error occurred while updating the user" });
    }
};

// Example usage of the middleware
export default authenticateToken;
