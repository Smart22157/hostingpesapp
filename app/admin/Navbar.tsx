'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../../styles/navbar.css';

const AdminNavbar = () => {
  const pathname = usePathname();

  // Check if current path hides navbar for auth pages
  const isAuthPage = pathname === '/admin/login' || pathname.startsWith('/admin/login/');

  if (isAuthPage) return null;

  return (
    <nav className="navbar">
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
    </nav>
  );
};

export default AdminNavbar;