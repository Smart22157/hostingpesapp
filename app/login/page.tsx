'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../styles/auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError('Invalid credentials');
        return;
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.removeItem('cart');
      router.push('/products');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Login</h1>
      {error && <p className="auth-message">{error}</p>}
      <form onSubmit={handleLogin} className="auth-form">
        <div>
          <label className="auth-label">Email:</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        <div>
          <label className="auth-label">Password:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        <button type="submit" className="auth-button">Login</button>
      </form>

      <div className="auth-footer">
        Don't have an account? <a href="/signup">Register here</a>
      </div>
    </div>
  );
};

export default LoginPage;
