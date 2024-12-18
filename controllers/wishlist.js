import Wishlist from '../models/wishListModel.js';

const createWishlist = async (req, res) => {
  try {
    const wishlist = new Wishlist({ userId: req.user._id, items: [] });
    await wishlist.save();
    res.status(201).json(wishlist);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const addItemToWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found' });
    wishlist.items.push({ productId });
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('items.productId');
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found' });
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const removeItemFromWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found' });
    wishlist.items = wishlist.items.filter(item => item.productId.toString() !== productId);
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export default {
  createWishlist,
  addItemToWishlist,
  getWishlist,
  removeItemFromWishlist
};
