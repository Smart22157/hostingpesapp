'use client';

import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import '../../styles/contact.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const serviceId = 'service_mb1ljg8';
      const notifyTemplateId = 'template_xec4xr9'; // sends to you
      const replyTemplateId = 'template_y5f6kla'; // sends to user
      const userId = 'dCRd5Rp5lP0p7zrMR';

      // Notify the business
      await emailjs.send(serviceId, notifyTemplateId, {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
      }, userId);

      // Auto-reply to the user
      await emailjs.send(serviceId, replyTemplateId, {
        to_name: formData.name,
        to_email: formData.email,
      }, userId);

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('EmailJS error:', error);
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>We would love to hear from you! Please fill out the form below to get in touch.</p>

      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Your full name"
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="you@example.com"
        />

        <label htmlFor="subject">Subject</label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={formData.subject}
          onChange={handleChange}
          required
          placeholder="Subject of your message"
        />

        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          required
          placeholder="Write your message here"
        />

        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>

        {status === 'success' && <p className="success-message">Message sent successfully!</p>}
        {status === 'error' && <p className="error-message">{errorMessage}</p>}
      </form>

      <div className="contact-info">
        <h2>Our Contact Information</h2>
        <p><strong>Address:</strong> 00216, Nairobi, Kenya</p>
        <p><strong>Phone:</strong> +254 707664929</p>
        <p><strong>Email:</strong> peselectronic2025@gmail.com</p>
        <p><strong>Working Hours:</strong> Mon - Fri, 9:00 AM - 6:00 PM / Sat 8:00 AM - 4:00 PM</p>
      </div>
    </div>
  );
}
