require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL in production
  credentials: true,
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected to Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  imageUrl: String,
  quantity: { type: Number, default: 0 },
  totalStock: { type: Number, default: 0 },
  soldPerWeek: { type: Number, default: 0 },
  soldPerMonth: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);

// Sample Products
const sampleProducts = [
  { name: 'Pump', description: 'High-efficiency pump', price: 150, category: 'Pumps', quantity: 100, imageUrl: '/Productimg/pump.png' },
  { name: 'Pipe', description: 'Durable PVC pipe', price: 50, category: 'Pipes', quantity: 200, imageUrl: '/Productimg/pipe.jpg' },
  { name: 'Frit Blender', description: 'Industrial frit blender', price: 300, category: 'Blenders', quantity: 50, imageUrl: '/Productimg/fritblender.jpg' },
  { name: 'Light', description: 'LED light bulb', price: 10, category: 'Lighting', quantity: 500, imageUrl: '/Productimg/light.jpg' },
  { name: 'Mixer', description: 'High-speed mixer', price: 120, category: 'Kitchen', quantity: 75, imageUrl: '/Productimg/mixer.jpg' },
  { name: 'Refrigerator', description: 'Energy-efficient refrigerator', price: 800, category: 'Appliances', quantity: 30, imageUrl: '/Productimg/refrigerator.jpg' },
  { name: 'Washing Machine', description: 'Front-load washing machine', price: 600, category: 'Appliances', quantity: 25, imageUrl: '/Productimg/washingmachine.jpg' },
  { name: 'Air Conditioner', description: 'Split AC unit', price: 400, category: 'Cooling', quantity: 20, imageUrl: '/Productimg/ac.jpg' },
  { name: 'Heater', description: 'Electric heater', price: 100, category: 'Heating', quantity: 40, imageUrl: '/Productimg/heater.jpg' },
  { name: 'Fan', description: 'Ceiling fan', price: 75, category: 'Cooling', quantity: 60, imageUrl: '/Productimg/fan.jpg' },
  { name: 'Toaster', description: '2-slice toaster', price: 30, category: 'Kitchen', quantity: 80, imageUrl: '/Productimg/toaster.jpg' },
  { name: 'Blender', description: 'Smoothie blender', price: 50, category: 'Kitchen', quantity: 90, imageUrl: '/Productimg/blender.jpg' },
  { name: 'Coffee Maker', description: 'Automatic coffee maker', price: 70, category: 'Kitchen', quantity: 55, imageUrl: '/Productimg/coffeemaker.jpg' },
  { name: 'Vacuum Cleaner', description: 'Cordless vacuum cleaner', price: 150, category: 'Cleaning', quantity: 35, imageUrl: '/Productimg/vacuum.jpg' },
  { name: 'Iron', description: 'Steam iron', price: 40, category: 'Cleaning', quantity: 45, imageUrl: '/Productimg/iron.jpg' },
  { name: 'Pressure Cooker', description: 'Stainless steel pressure cooker', price: 60, category: 'Kitchen', quantity: 50, imageUrl: '/Productimg/pressurecooker.jpg' },
  { name: 'Rice Cooker', description: 'Electric rice cooker', price: 40, category: 'Kitchen', quantity: 70, imageUrl: '/Productimg/ricecooker.jpg' },
  { name: 'Dishwasher', description: 'Energy-efficient dishwasher', price: 700, category: 'Appliances', quantity: 15, imageUrl: '/Productimg/dishwasher.jpg' },
  { name: 'Oven', description: 'Convection oven', price: 300, category: 'Kitchen', quantity: 20, imageUrl: '/Productimg/oven.jpg' },
  { name: 'Grill', description: 'Electric grill', price: 100, category: 'Kitchen', quantity: 30, imageUrl: '/Productimg/grill.jpg' },
  { name: 'Food Processor', description: 'Multi-functional food processor', price: 150, category: 'Kitchen', quantity: 25, imageUrl: '/Productimg/foodprocessor.jpg' },
  { name: 'Bar', description: 'High-quality bar', price: 20, category: 'Bars', quantity: 20, imageUrl: '/Productimg/bar.jpg' },
];

// Seed Route
app.post('/seed-products', async (req, res) => {
  try {
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    res.status(201).json({ message: 'Sample products created successfully.' });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Update Product
app.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    res.status(200).json({ message: 'Product updated successfully.', product });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Create Product
app.post('/products', async (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required.' });
  }
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Product created successfully.', product });
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get All Products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error('Get error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🛍️ Product server running on http://localhost:${PORT}`);
});
