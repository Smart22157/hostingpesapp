'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Status = 'Pending' | 'Success' | 'Failed';

export default function ConfirmationPage() {
  const params = useSearchParams();
  const requestId = params.get('requestId')!;
  const [status, setStatus] = useState<Status>('Pending');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await fetch(`http://localhost:5000/mpesa/status/${requestId}`);
        const data: { status: Status; message: string } = await res.json();
        setStatus(data.status);
        setMessage(data.message);
        if (data.status !== 'Pending') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Status check failed', err);
      }
    };

    // Poll every 3 seconds
    interval = setInterval(checkStatus, 3000);
    checkStatus(); // initial call

    return () => clearInterval(interval);
  }, [requestId]);

  return (
    <div className="confirmation-container">
      <h1>Payment Status</h1>
      <p>Request ID: <strong>{requestId}</strong></p>
      <p>Status: <strong>{status}</strong></p>
      {message && <p>Details: {message}</p>}
      {status === 'Success' && (
        <button onClick={() => router.push('/orders')}>View Your Orders</button>
      )}
      {status === 'Failed' && (
        <button onClick={() => router.push('/checkout')}>Try Again</button>
      )}
    </div>
  );
}
