'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../../styles/auth.css';

const AdminLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true); // Set loading to true
    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.role === 'admin') {
          setMessage('Admin login successful!');
          router.push('/admin/dashboard');
        } else {
          setMessage('Access denied: Not an admin.');
        }
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (err) { // Changed 'error' to 'err'
      console.error('Login error:', err); // Log the error
      setMessage('An error occurred');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Admin Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label htmlFor="email" className="auth-label">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        <div>
          <label htmlFor="password" className="auth-label">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {message && <p className="auth-message">{message}</p>}
    </div>
  );
};

export default AdminLogin;