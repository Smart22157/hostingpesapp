const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5002; // Use a different port for the cart server

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import the Product model
const Product = require('./models/product'); // Corrected path to product model

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
      .populate('productId', 'name price imageUrl'); // Populate name, price, imageUrl from Product model

    // Map the cart items to include product details
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

// Start the server
app.listen(PORT, () => {
  console.log(`Cart server is running on http://localhost:${PORT}`);
});
