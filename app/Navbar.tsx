'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../styles/navbaruser.css';

const Navbar = () => {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/admin/login'|| pathname ==='/admin/dashboard'|| pathname ==='/admin/customers' || pathname === '/admin/login'|| pathname ==='/admin/dashboard'|| pathname ==='/admin/customers'||  pathname ==='/admin/payments' ||  pathname ==='/admin/logout';

  if (isAuthPage) return null;

  return (
    <nav className="navbar">
    <div className="logo">Pes Electronic</div> {}
    <ul>
      <li><Link href="/products">Products</Link></li>
      <li><Link href="/cart">Cart</Link></li>
      <li><Link href="/checkout">Checkout</Link></li>
      <li><Link href="/Contact">Contact</Link></li>
      <li><Link href="/location">Maps</Link></li>
      <li><Link href="/Profile">Profile</Link></li>
    </ul>
  </nav>
  );
};

export default Navbar;
