require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', // or your deployed frontend URL
  credentials: true,
}));

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected to Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Product Model (adjust path if needed)
const Product = require('./models/product');

// Cart Item Schema
const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

// Add to Cart Route
app.post('/cart', async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const cartItem = new CartItem({ productId, quantity });
    await cartItem.save();
    res.status(201).json({ message: 'Item added to cart successfully.', cartItem });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
});

// Get Cart Route
app.get('/cart', async (req, res) => {
  try {
    const cartItems = await CartItem.find()
      .populate('productId', 'name price imageUrl');

    const cartItemsWithDetails = cartItems.map(item => ({
      _id: item._id,
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
      imageUrl: item.productId.imageUrl,
    }));

    res.status(200).json(cartItemsWithDetails);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
});

// Delete Cart Item Route
app.delete('/cart/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await CartItem.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }
    res.status(200).json({ message: 'Cart item deleted successfully.' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Cart server running on http://localhost:${PORT}`);
});
