"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function WalletVerifyPage() {
  const [status, setStatus] = useState('Verifying your payment...');
  const [isLoading, setIsLoading] = useState(true);
  const [verificationData, setVerificationData] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const transaction_id = searchParams.get('transaction_id');
  const tx_ref = searchParams.get('tx_ref');
  const statusParam = searchParams.get('status');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!transaction_id || !tx_ref) {
        setStatus('Missing transaction parameters');
        setIsLoading(false);
        startRedirectTimer();
        return;
      }

      try {
        setIsLoading(true);
        
        // Call our backend verification API
        const response = await fetch(
          `/api/wallets/verify?transaction_id=${transaction_id}&tx_ref=${tx_ref}&status=${statusParam}`
        );

        const data = await response.json();

        if (data.success) {
          setStatus(`✅ Payment Successful! ₦${parseFloat(data.amount).toLocaleString()} has been added to your ${getWalletDisplayName(data.walletType)} Wallet.`);
          setVerificationData(data);
        } else {
          setStatus(`❌ Payment Failed: ${data.error || 'Please try again.'}`);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('❌ Error verifying payment. Please contact support.');
      } finally {
        setIsLoading(false);
        startRedirectTimer();
      }
    };

    if (transaction_id && tx_ref) {
      verifyPayment();
    } else {
      setStatus('Invalid payment parameters');
      setIsLoading(false);
      startRedirectTimer();
    }
  }, [transaction_id, tx_ref, statusParam]);

  const startRedirectTimer = () => {
    setTimeout(() => {
      router.push('/account');
    }, 5000);
  };

  const getWalletDisplayName = (type) => {
    const names = {
      'cashWallet': 'Cash',
      'gadgetWallet': 'Gadget', 
      'foodWallet': 'Food'
    };
    return names[type] || 'Wallet';
  };

  const handleRedirect = () => {
    router.push('/account');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Loading/Status Icon */}
        <div className="mb-6">
          {isLoading ? (
            <div className="relative">
              <div className="w-20 h-20 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          ) : verificationData ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Status Message */}
        <h2 className={`text-2xl font-bold mb-4 ${
          verificationData ? 'text-green-600' : 
          isLoading ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {isLoading ? 'Processing...' : 
           verificationData ? 'Success!' : 'Failed'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {status}
        </p>

        {/* Transaction Details */}
        {verificationData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-left">
                <span className="text-gray-600">Amount:</span>
              </div>
              <div className="text-right font-semibold">
                ₦{parseFloat(verificationData.amount).toLocaleString()}
              </div>
              
              <div className="text-left">
                <span className="text-gray-600">Wallet:</span>
              </div>
              <div className="text-right font-semibold">
                {getWalletDisplayName(verificationData.walletType)}
              </div>
            </div>
          </div>
        )}

        {/* Transaction Reference */}
        {tx_ref && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Transaction Reference</p>
            <p className="text-sm font-mono text-gray-800 break-all">
              {tx_ref}
            </p>
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={handleRedirect}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
        >
          Go to Account
        </button>

        {/* Auto-redirect notice */}
        <p className="text-sm text-gray-500 mt-4">
          {!isLoading && 'Redirecting automatically in 5 seconds...'}
        </p>
      </div>
    </div>
  );
}