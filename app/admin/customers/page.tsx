'use client';

import '../../../styles/navbar.css';
import React, { useEffect, useState } from 'react';
import '../../../styles/adminCustomers.css';

interface Customer {
  _id: string;
  username: string;
  email: string;
  role: string;
  orderStatus?: string;
}

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please login.');
        }

        const res = await fetch('http://localhost:5000/admin/customers', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        console.log('✅ Customers:', data);
        setCustomers(data); // ✅ Set state with fetched customers
        setLoading(false);
      } catch (err: any) {
        console.error('❌ Fetch customers error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const updateOrderStatus = async (customerId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/admin/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: status }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setCustomers(prev =>
        prev.map(c => (c._id === customerId ? { ...c, orderStatus: status } : c))
      );
    } catch {
      alert('Failed to update order status. Please try again.');
    }
  };

  if (loading) return <p>Loading customers...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="admin-customers-container">
      <h1>Customer Orders</h1>
      <table className="customers-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Order Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer._id}>
              <td>{customer.username}</td>
              <td>{customer.email}</td>
              <td>{customer.role}</td>
              <td>{customer.orderStatus || 'Pending'}</td>
              <td>
                <button onClick={() => updateOrderStatus(customer._id, 'Confirmed')}>
                  Confirm
                </button>
                <button onClick={() => updateOrderStatus(customer._id, 'Cancelled')}>
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCustomersPage;
