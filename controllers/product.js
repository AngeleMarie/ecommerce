// controllers/product.js
import Product from '../models/productModel.js';
import cloudinary from "cloudinary"


export const addProduct = async (req, res) => {
  try {
    const { name,type, quantity, description, usageGuide } = req.body;
    let pictureUrl='';

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
        uploadStream.end(buffer);
      });
    };

    if (req.file && req.file.buffer) {
      try {
        pictureUrl = await uploadToCloudinary(req.file.buffer);
        console.log("Uploaded Image URL: ", pictureUrl);
      } catch (error) {
        console.log("Cloudinary upload error:", error.message);
        return res.status(500).json({ error: "Image upload failed" });        
      }
    }
    
    const product = new Product({
      name,
      type,
      quantity,
      description,
      usageGuide,
      picture: pictureUrl,
    });

    await product.save();
    console.log(product);
    
    res.status(201).json(product);
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
}

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a product with optional image upload
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
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
        updatedData.picture = pictureUrl; // Update the Cloudinary URL
      } catch (error) {
        console.error("Cloudinary upload error:", error.message);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    // Update the product in the database
    const product = await Product.findByIdAndUpdate(productId, updatedData, {
      new: true, 
      runValidators: true, 
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ error: "An error occurred while updating the product" });
  }
};


// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
