'use client';

import React, { useEffect, useState } from 'react';
import '../../../styles/adminPayments.css'; // 🔗 Importing CSS

interface Payment {
  _id: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    email: string;
  } | null;
}

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    try {
      const res = await fetch('http://localhost:5000/admin/payments');
      if (!res.ok) throw new Error('Failed to fetch payments');
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      setError('Error loading payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleClearPayment = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/payments/${id}/clear`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error('Failed to update payment status');
      setPayments(prev =>
        prev.map(payment =>
          payment._id === id ? { ...payment, status: 'Cleared' } : payment
        )
      );
    } catch {
      setError('Failed to update payment status');
    }
  };

  if (loading) return <p>Loading payments...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-payments-container">
      <h1>Admin Payments</h1>
      {payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Merchant Request ID</th>
              <th>Checkout Request ID</th>
              <th>Response Code</th>
              <th>Response Description</th>
              <th>Customer Message</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment._id}>
                <td>{payment.user ? payment.user.username : 'Unknown'}</td>
                <td>{payment.merchantRequestId}</td>
                <td>{payment.checkoutRequestId}</td>
                <td>{payment.responseCode}</td>
                <td>{payment.responseDescription}</td>
                <td>{payment.customerMessage}</td>
                <td
                  className={
                    payment.status === 'Cleared'
                      ? 'status-cleared'
                      : 'status-pending'
                  }
                >
                  {payment.status}
                </td>
                <td>{new Date(payment.createdAt).toLocaleString()}</td>
                <td>
                  {payment.status !== 'Cleared' ? (
                    <button onClick={() => handleClearPayment(payment._id)}>
                      Mark as Cleared
                    </button>
                  ) : (
                    <span className="ready-to-ship">✅ Ready to Ship</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
