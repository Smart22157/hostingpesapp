'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../styles/auth.css';

const Signup = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, phoneNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Signup successful! You can now log in.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setMessage(data.message || 'Signup failed');
      }
    } catch (error) {
      setMessage('An error occurred');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Sign Up</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label htmlFor="username" className="auth-label">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="auth-input"
          />
        </div>
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
        <div>
          <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="auth-label">Phone Number</label>
          <input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="auth-input"
          />
        </div>
        <button type="submit" className="auth-button">Sign Up</button>
      </form>
      {message && <p className="auth-message">{message}</p>}
      <p className="auth-footer">
        Already have an account?{' '}
        <a href="/login">Log in</a>
      </p>
    </div>
  );
};

export default Signup;