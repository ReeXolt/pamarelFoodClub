"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (!reference) {
      router.push('/join-member');
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payment/verify?reference=${reference}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Payment verification failed');
        }

        toast.success('Payment successful! Your plan has been activated.');
        router.push('/account');

      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error(error.message || 'Payment verification failed');
        router.push('/join-member');
      }
    };

    verifyPayment();
  }, [reference, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-medium text-gray-900">Verifying your payment...</h2>
        <p className="mt-2 text-gray-600">Please wait while we confirm your payment.</p>
      </div>
    </div>
  );
}