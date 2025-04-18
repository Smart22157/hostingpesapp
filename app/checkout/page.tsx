'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../styles/checkout.css';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchCart() {
      const res = await fetch('http://localhost:5002/cart');
      const data: CartItem[] = await res.json();
      setCartItems(data);
      setTotal(data.reduce((sum, item) => sum + item.price * item.quantity, 0));
    }
    fetchCart();
  }, []);

  const handleMpesaPayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/mpesa/stk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone, amount: total })
      });
      const data = await res.json();
      // data.CheckoutRequestID will identify this transaction
      router.push(`/checkout/confirm?requestId=${data.CheckoutRequestID}`);
    } catch (err) {
      alert('Failed to initiate payment.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  if (cartItems.length === 0) return <p>Your cart is empty.</p>;

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <ul className="checkout-cart-list">
  {cartItems.map((item, index) => (
    <li key={`${item.productId}-${index}`} className="checkout-cart-item">
      <span>{item.name}</span>
      <span>Qty: {item.quantity}</span>
      <span>ksh{item.price.toFixed(2)}</span>
      <span>Subtotal: ksh{(item.price * item.quantity).toFixed(2)}</span>
    </li>
  ))}
</ul>
      <h2>Total: Ksh{total.toFixed(2)}</h2>
      <input
        type="tel"
        placeholder="Enter M-Pesa phone number"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleMpesaPayment} disabled={loading || !phone}>
        {loading ? 'Processing…' : 'Pay with M-Pesa'}
      </button>
    </div>
  );
}
