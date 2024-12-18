// controllers/cart.js
import Cart from '../models/cartModel.js';

const createCart = async (req, res) => {
    try {
        const cart = new Cart({ userId: req.user._id, items: [] });
        await cart.save();
        res.status(201).json(cart);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const addItemToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        const existingItem = cart.items.find(item => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const removeItemFromCart = async (req, res) => {
    const { productId } = req.body;
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

export default {
    createCart,
    addItemToCart,
    getCart,
    removeItemFromCart
};
