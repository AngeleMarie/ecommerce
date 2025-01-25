import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import dbConnection from "./config/dbConfig.js";
import authRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
// import fileUpload from "express-fileupload";
import path from "path";
import bodyParser from "body-parser";
import multer from "multer";
import { fileURLToPath } from "url";
import cors from "cors";
import compression from "compression";
import "./config/passport.js";
import cloudinary from "cloudinary";


const PORT = process.env.PORT || 5000;
const app = express();

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "angele",
    resave: false,
    saveUninitialized: true,
  })
);

const allowedOrigins = [
  'http://localhost:3000',
  'https://agriorganic-fe.vercel.app',
  'https://www.agriorgacfarmltd.com'
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      // Allow requests with no origin (like mobile apps or Postman)
      callback(null, true);
    } else {
      // Deny requests from unauthorized origins
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  credentials: true, // Enable sending cookies and credentials
  optionsSuccessStatus: 200 // For legacy browser support
};

// Enable CORS
app.use(cors(corsOptions));

// Error handling for CORS
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy does not allow access from this origin.' });
  }
  next(err);
});

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Database connection
dbConnection();

// Routes
app.use("/api/v1/users/auth", authRoutes);
app.use("/api/v1/admin/products", productRoutes);
app.use("/api/v1/users/wishlist", wishlistRoutes);
app.use("/api/v1/users/cart", cartRoutes);
app.use("/api/v1/problems", problemRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error stack:", err.stack);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: err.message || "An unexpected error occurred" });
});
app.use((err, req, res, next) => {
  if (err.message.includes('Unexpected end of form')) {
    console.error('Error: Incomplete form submission');
    return res.status(400).json({ error: 'Incomplete form submission. Ensure all fields and files are properly attached.' });
  }
  console.error('Error stack:', err.stack);
  res.status(500).json({ error: err.message || 'An unexpected error occurred.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
