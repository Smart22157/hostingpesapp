const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  imageUrl: String,
  quantity: Number,
  totalStock: Number,
  soldPerWeek: Number,
  soldPerMonth: Number,
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;