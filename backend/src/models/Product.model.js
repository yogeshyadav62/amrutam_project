const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    category: { type: String, required: true, index: true },
    size: { type: String, default: '200ml' },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    rating: { type: Number, default: 4.9 },
    reviewCount: { type: Number, default: 50 },
    badge: { type: String, default: 'BESTSELLER' },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 100 },
    description: { type: String },
    ingredients: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
