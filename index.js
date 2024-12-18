import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import dbConnection from "./config/dbConfig.js";
import authRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js"
import wishlistRoutes from "./routes/wishlistRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import problemRoutes from "./routes/problemRoutes.js"

import "./config/passport.js";
import cors from 'cors'
import bodyParser from "body-parser";


dotenv.config();

const PORT = process.env.PORT
const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());

app.use(session({
  secret: process.env.SESSION_SECRET || 'angele',
  resave: false,
  saveUninitialized: true
}));
app.use(cors({
  origin: [ "http://localhost:3000"],  
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(passport.initialize());
app.use(passport.session());


dbConnection();

app.use('/api/v1/users/auth', authRoutes);
app.use('/api/v1/admin/products', productRoutes);
app.use('/api/v1/users/wishlist', wishlistRoutes);
app.use('/api/v1/users/cart', cartRoutes);
app.use('/api/v1/problems', problemRoutes);



// Error handling middleware for multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message });
  } else if (err) {
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
