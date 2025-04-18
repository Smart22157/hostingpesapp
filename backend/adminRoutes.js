const express = require('express');
const router = express.Router();
const User = require('./models/User');
const MpesaPayment = require('./models/MpesaPayment');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Removed authentication middleware to allow open access for customers route
router.get('/customers', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' });
    res.json(customers);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching customers.' });
  }
});

// Profile route to get current user info
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No authorization header' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(payload.userId).select('username email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
});

// List all payments with user info populated
router.get('/payments', async (req, res) => {
  try {
    const payments = await MpesaPayment.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'username email'); // populate user info

    // Map payments to include customer name (username)
    const paymentsWithUser = payments.map(payment => ({
      _id: payment._id,
      merchantRequestId: payment.merchantRequestId,
      checkoutRequestId: payment.checkoutRequestId,
      responseCode: payment.responseCode,
      responseDescription: payment.responseDescription,
      customerMessage: payment.customerMessage,
      status: payment.status,
      createdAt: payment.createdAt,
      user: payment.userId ? {
        username: payment.userId.username,
        email: payment.userId.email,
      } : null,
    }));

    res.json(paymentsWithUser);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching payments.' });
  }
});

// Update payment status to cleared (ready to ship)
router.put('/payments/:id/clear', async (req, res) => {
  const { id } = req.params;
  try {
    const payment = await MpesaPayment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }
    payment.status = 'Cleared';
    await payment.save();
    res.json({ message: 'Payment cleared and ready to ship.', payment });
  } catch (e) {
    res.status(500).json({ message: 'Error updating payment status.' });
  }
});

module.exports = router;