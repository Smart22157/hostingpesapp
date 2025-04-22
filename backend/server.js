require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const moment = require('moment');
const bodyParser = require('body-parser');

// Models
const User = require('./models/User');
const Product = require('./models/product');
const MpesaPayment = require('./models/MpesaPayment');

// Middleware
const authenticateToken = require('./middleware/auth');
const adminRoutes = require('./adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// M-Pesa config
const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortcode: process.env.MPESA_SHORTCODE,
  passkey: process.env.MPESA_PASSKEY,
  callbackURL: process.env.MPESA_CALLBACK_URL,
  oauthUrl: process.env.MPESA_OAUTH_URL,
  stkPushUrl: process.env.MPESA_STKPUSH_URL,
};

// Middlewares
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
// Connect to MongoDB Atlas only
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected to Atlas'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// Multer for uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// ===== AUTH Routes =====
app.post('/signup', async (req, res) => {
  const { username, email, password, phoneNumber, role } = req.body;
  try {
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ message: 'User already exists.' });

    const passwordHash = await bcrypt.hash(password, 10);
    await new User({ username, email, passwordHash, phoneNumber, role }).save();
    res.status(201).json({ message: 'User created.' });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, userId: user._id, role: user.role });
  } catch (e) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ===== PRODUCTS =====
app.post('/products', authenticateToken, upload.single('image'), async (req, res) => {
  const { name, description, price, category, quantity } = req.body;
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const product = new Product({ name, description, price, category, imageUrl, quantity });
    await product.save();
    res.status(201).json(product);
  } catch (e) {
    res.status(500).json({ message: 'Product upload failed.' });
  }
});

app.get('/products', async (req, res) => {
  const list = await Product.find().sort({ createdAt: -1 });
  res.json(list);
});

app.delete('/products/:id', authenticateToken, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted.' });
});

// ===== MPESA STK PUSH =====
async function getMpesaToken() {
  const auth = Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64');
  const res = await axios.get(mpesaConfig.oauthUrl, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return res.data.access_token;
}

app.post('/mpesa/stk', authenticateToken, async (req, res) => {
  const { phone, amount } = req.body;
  const userId = req.userId; // get userId from authenticated token
  try {
    const token = await getMpesaToken();
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(mpesaConfig.shortcode + mpesaConfig.passkey + timestamp).toString('base64');

    const payload = {
      BusinessShortCode: mpesaConfig.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: mpesaConfig.shortcode,
      PhoneNumber: phone,
      CallBackURL: mpesaConfig.callbackURL,
      AccountReference: 'PES E-Shop',
      TransactionDesc: 'Online Order',
    };

    const response = await axios.post(mpesaConfig.stkPushUrl, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await MpesaPayment.create({
      userId, // save userId in payment
      merchantRequestId: response.data.MerchantRequestID,
      checkoutRequestId: response.data.CheckoutRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
      customerMessage: response.data.CustomerMessage,
      status: 'Pending',
    });

    res.json(response.data);
  } catch (e) {
    res.status(500).json({ message: 'STK push failed.', error: e.response?.data || e.message });
  }
});

app.post('/mpesa/callback', async (req, res) => {
  const cb = req.body.Body.stkCallback;
  const status = cb.ResultCode === 0 ? 'Success' : 'Failed';
  const message = cb.ResultDesc;

  await MpesaPayment.findOneAndUpdate(
    { checkoutRequestId: cb.CheckoutRequestID },
    { status, customerMessage: message }
  );

  res.sendStatus(200);
});

app.get('/mpesa/status/:requestId', async (req, res) => {
  const record = await MpesaPayment.findOne({ checkoutRequestId: req.params.requestId });
  if (!record) return res.json({ status: 'Pending', message: '' });
  res.json({ status: record.status, message: record.customerMessage });
});

// ===== ADMIN ROUTES =====
app.use('/admin', adminRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
