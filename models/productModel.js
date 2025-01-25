import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 }, 
  picture: { type: String },  // Store image as binary data
  usageGuide: { type: String, default: '' }, // Usage guide field
}, { 
  timestamps: true 
});

export default mongoose.model('Product', productSchema);
