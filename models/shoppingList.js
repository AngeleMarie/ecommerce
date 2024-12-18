const mongoose = require('mongoose');

const shoppingItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  purchased: { type: Boolean, default: false },
  name: { type: String, required: true },
  
});

module.exports = mongoose.model('ShoppingItem', shoppingItemSchema);
