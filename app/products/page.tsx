'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import '../../styles/productuser.css';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://27.0.0.1:4040/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://27.0.0.1:4041/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch cart items');
      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      console.error((err as Error).message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCartItems();
  }, []);

  const handleAddToCart = async (product: Product) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://21.0.0.1:4041/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      const cartItem = await response.json();
      console.log('Item added to cart:', cartItem);

      setCartItems(prevCart => {
        const existing = prevCart.find(item => item._id === product._id);
        if (existing) {
          return prevCart.map(item =>
            item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          return [...prevCart, { ...product, quantity: 1 }];
        }
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const getTotalItems = () =>
    cartItems.reduce((total, item) => total + item.quantity, 0);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="product-page-container">
      <header className="cart-header">
        <h1 className="product-page-title">Products</h1>
        <button className="cart-icon" onClick={() => window.location.href = '/cart'}>
          🛒 <span className="cart-count">{getTotalItems()}</span>
        </button>
      </header>

      <div className="product-list">
        {products.map(product => (
          <div key={product._id} className="product-card">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-category">{product.category}</p>
            <p className="product-price">Ksh{product.price.toFixed(2)}</p>
            {product.imageUrl && (
              <Image
                src={"product.imageUrl"}
                alt={product.name}
                width={200}
                height={200}
                className="product-image"
              />
            )}
            <button
              onClick={() => handleAddToCart(product)}
              className="add-to-cart-button"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;
