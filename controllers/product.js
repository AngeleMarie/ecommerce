import Product from '../models/productModel.js';

export const addProduct = async (req, res) => {
  try {
    const { name, price, quantity, description, usageGuide } = req.body;
    const picture = req.file ? req.file.path : null;  // Set picture to file path if uploaded

    // Create a new product instance
    const product = new Product({
      name,
      price,
      quantity,
      description,
      usageGuide,
      picture, 
    });

    await product.save(); // Save the product to the database
    res.status(201).json(product);  // Send the product as a response
  } catch (error) {
    console.error("Database save error:", error.message);
    res.status(500).json({ error: "An error occurred while saving the product. Please try again." });
  }
};
      
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    // Map over products to convert binary `picture` to base64 for each product
    const productsWithImages = products.map(product => {
      const base64Image = product.picture ? product.picture.toString('base64') : null;
      return {
        ...product._doc, // Spreads the rest of the product properties
        picture: base64Image ? `data:image/png;base64,${base64Image}` : null,
      };
    });

    res.json(productsWithImages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id; // Get the ID from the request
    console.log('Product ID:', productId); // Log the product ID to debug

    // Check if the productId is defined
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({
      error: error.message || 'An error occurred while updating the product',
    });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
