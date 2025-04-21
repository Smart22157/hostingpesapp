'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../styles/cart.css';

interface CartItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view your cart.');
        return;
      }

      const res = await fetch('http://localhost:5002/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch cart items');

      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      setError('Failed to load cart items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    const total = cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
    setTotalPrice(total);
  }, [cartItems]);

  const handleRemoveFromCart = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/cart/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete item');

      setCartItems(prev => prev.filter(item => item._id !== id));
    } catch {
      setError('Failed to remove item from cart. Please try again.');
    }
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5002/cart/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) throw new Error('Failed to update quantity');

      setCartItems(prev =>
        prev.map(item => (item._id === id ? { ...item, quantity } : item))
      );
    } catch {
      setError('Failed to update quantity. Please try again.');
    }
  };

  const goToCheckout = () => {
    router.push('/checkout');
  };

  if (loading) return <p>Loading cart items...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="cart-page-container">
      <h1 className="cart-page-title">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-list">
            {cartItems.map(item => (
              <div key={item._id} className="cart-item">
                <img
                  src={item.imageUrl ? `http://localhost:3000${item.imageUrl}` : '/placeholder.png'}
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-price">Ksh.{item.price.toFixed(2)}</p>
                  <label className="cart-item-quantity">
                    Qty:
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      onChange={e => handleUpdateQuantity(item._id, Number(e.target.value))}
                    />
                  </label>
                  <button
                    onClick={() => handleRemoveFromCart(item._id)}
                    className="remove-from-cart-button"
                  >
                    Remove
                  </button>



                  
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2 className="total-price">Total: Ksh{totalPrice.toFixed(2)}</h2>
            <button
              onClick={goToCheckout}
              className="proceed-to-checkout-button"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;