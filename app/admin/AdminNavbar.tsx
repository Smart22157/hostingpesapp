'use client';

import React from 'react';
import Link from 'next/link';


const AdminNavbar = () => {
  return (
    <nav className="admin-navbar">
      <ul>
        <li>
          <Link href="/admin/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link href="/admin/customers">Customers</Link>
        </li>
        <li>
          <Link href="/admin/payments">Payments</Link>
        </li>
        <li>
          <Link href="/admin/login">Logout</Link>
        </li>
      </ul>
      <style jsx>{`
        .admin-navbar {
          background-color: #222;
          padding: 10px 20px;
          display: flex;
          align-items: center;
        }
        .admin-navbar ul {
          list-style: none;
          display: flex;
          gap: 25px;
          margin: 0;
          padding: 0;
        }
        .admin-navbar li a {
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
        }
        .admin-navbar li a:hover {
          text-decoration: underline;
        }
      `}</style>
    </nav>
  );
};

export default AdminNavbar;
