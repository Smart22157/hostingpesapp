'use client';

import React, { useEffect, useState, useCallback } from 'react';
import '../../../styles/product.css';
import '../../../styles/navbar.css';
import AdminNavbar from '../AdminNavbar';
import Image from 'next/image'; // Import Image from next/image

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  quantity: number;
}

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Product>({
    _id: '',
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
    quantity: 0,
  });
  const [message, setMessage] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError('Unauthorized: Please log in as admin.');
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch products');
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // Include fetchProducts in the dependency array

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Unauthorized: Please log in as admin.');
      return;
    }
    if (!form.name || !form.price || !form.imageUrl) {
      setMessage('Name, price, and image URL are required.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5001/products${form._id ? `/${form._id}` : ''}`, {
        method: form._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: form.price,
          category: form.category,
          imageUrl: form.imageUrl,
          quantity: form.quantity,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to add/update product');
      }
      setMessage(`Product ${form._id ? 'updated' : 'added'} successfully.`);
      setForm({
        _id: '',
        name: '',
        description: '',
        price: 0,
        category: '',
        imageUrl: '',
        quantity: 0,
      });
      fetchProducts();
    } catch (err) {
      setMessage((err as Error).message);
    }
  };

  const handleEditProduct = (product: Product) => {
    setForm(product);
  };

  const handleDeleteProduct = async (id: string) => {
    setMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Unauthorized: Please log in as admin.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5001/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete product');
      }
      setMessage('Product deleted successfully.');
      fetchProducts();
    } catch (err) {
      setMessage((err as Error).message);
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <>
      <AdminNavbar />
      <div className="admin-dashboard-container">
        <h1 className="admin-dashboard-title">Admin Dashboard - Product Management</h1>

        <form onSubmit={handleAddOrUpdateProduct} className="admin-form">
          <h2 className="text-xl font-semibold mb-4">{form._id ? 'Update Product' : 'Add New Product'}</h2>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleInputChange}
            required
            step="0.01"
            min="0"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="imageUrl"
            placeholder="Image URL (e.g., /Productimg/IMG_9976.png)"
            value={form.imageUrl}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleInputChange}
            min="0"
          />
          <button type="submit">{form._id ? 'Update Product' : 'Add Product'}</button>
          {message && <p className="auth-message">{message}</p>}
        </form>

        <h2 className="text-xl font-semibold mb-4">Existing Products</h2>
        <div className="admin-product-list">
          {products.map((product) => (
            <div key={product._id} className="admin-product-card">
              <h3 className="admin-product-name">{product.name}</h3>
              <p className="admin-product-category">{product.category}</p>
              <p className="admin-product-price">Ksh{product.price.toFixed(2)}</p>
              <p>Quantity: {product.quantity}</p>
              {product.imageUrl && (
                <Image src={`http://localhost:3000${product.imageUrl}`} alt={product.name} width={200} height={200} className="product-image" />
              )}
              <button
                onClick={() => handleEditProduct(product)}
                className="auth-button"
                style={{ marginTop: '0.5rem', backgroundColor: '#3182ce' }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteProduct(product._id)}
                className="auth-button"
                style={{ marginTop: '0.5rem', backgroundColor: '#e53e3e' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;