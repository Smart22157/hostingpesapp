'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import AdminNavbar from './Navbar';
import { usePathname } from 'next/navigation';


interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const pathname = usePathname();
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    // Hide navbar on login and signup pages
    if (pathname === '/admin/login' || pathname === '/admin/signup') {
      setShowNavbar(false);
    } else {
      setShowNavbar(true);
    }
  }, [pathname]);

  return (
    <html lang="en">
      <body>
        {showNavbar && <AdminNavbar />}
        <main>{children}</main>
      </body>
    </html>
  );
};

export default AdminLayout;
