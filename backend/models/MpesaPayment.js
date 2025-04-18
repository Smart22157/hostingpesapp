const mongoose = require('mongoose');

const mpesaPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  merchantRequestId: String,
  checkoutRequestId: String,
  responseCode: String,
  responseDescription: String,
  customerMessage: String,
  status: { type: String, enum: ['Pending', 'Success', 'Failed', 'Cleared'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

const MpesaPayment = mongoose.models.MpesaPayment || mongoose.model('MpesaPayment', mpesaPaymentSchema);

module.exports = MpesaPayment;
