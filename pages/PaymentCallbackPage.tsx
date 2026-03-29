import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus('error');
        return;
      }

      try {
        const response = await fetch(`/api/paystack/verify/${reference}`);
        if (!response.ok) throw new Error('Verification failed');
        
        const data = await response.json();
        
        if (data.status === 'success') {
          const { uid, cartId } = data.metadata;
          
          // Log transaction to Firestore
          const logRef = doc(db, 'public', uid, 'transaction_logs', reference);
          await setDoc(logRef, {
            ...data,
            amount: {
              naira: data.amount / 100,
              kobo: data.amount
            },
            cartId,
            createdAt: serverTimestamp(),
            status: 'success'
          });
          
          setStatus('success');
          setTimeout(() => navigate('/profile/transactions'), 2000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [reference, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="animate-spin text-accent mx-auto mb-4" size={48} />
            <h2 className="text-ui font-heading text-xl">Verifying Payment...</h2>
          </>
        )}
        {status === 'success' && (
          <h2 className="text-green-500 font-heading text-xl">Payment Successful! Redirecting...</h2>
        )}
        {status === 'error' && (
          <h2 className="text-red-500 font-heading text-xl">Payment Verification Failed.</h2>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
