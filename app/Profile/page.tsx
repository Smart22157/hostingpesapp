'use client';

import React, { useEffect, useState } from 'react';
import '../../styles/profile.css'; // Adjust path as needed

interface User {
  _id: string;
  username: string;
  email: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in.');
        return;
      }

      const response = await fetch('http://localhost:5000/admin/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data: User = await response.json();
      setUser(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/logout', {
        method: 'POST',
      });

      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {user ? (
        <div className="profile-card">
          <h2>{user.username}</h2>
          <p>Email: {user.email}</p>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default ProfilePage;
