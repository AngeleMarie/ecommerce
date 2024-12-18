import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Setup multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the upload folder
  },
  filename: function (req, file, cb) {
    // Use the current timestamp and original file name to ensure uniqueness
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Validate file type (only allow images: PNG, JPG, JPEG)
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file type, only JPEG, PNG, or JPG are allowed'), false); // Reject the file
  }
};

// Limit file size to 5MB
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Export the upload middleware
export default upload;
