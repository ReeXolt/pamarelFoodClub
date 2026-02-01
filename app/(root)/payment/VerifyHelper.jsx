"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentVerify() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState("verifying");

  // Get query params from URL
  const transaction_id = searchParams.get("transaction_id");
  const tx_ref = searchParams.get("tx_ref");
  const status = searchParams.get("status");
  const reference = searchParams.get("reference");


  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Use the transaction_id and tx_ref from Flutterwave redirect
        const paymentReference = transaction_id || tx_ref || reference;


        if (!paymentReference) {
          setVerificationStatus("failed");
          router.push("/payment/failed?error=no_reference");
          return;
        }


        // If we have status from Flutterwave redirect, use it directly
        if (status) {
          if (status === 'completed') {
            // The backend will handle the actual verification
            const response = await fetch(
              `/api/payment/verify?transaction_id=${transaction_id}&tx_ref=${tx_ref}&status=${status}`
            );

            if (response.ok) {
              setVerificationStatus("success");
              // Redirect to success page - the backend handles the actual redirect
              window.location.href = response.url;
            } else {
              setVerificationStatus("failed");
              router.push("/payment/failed?error=verification_failed");
            }
          } else if (status === 'cancelled') {
            setVerificationStatus("cancelled");
            router.push("/payment/failed?error=payment_cancelled");
          } else {
            setVerificationStatus("failed");
            router.push("/payment/failed?error=payment_failed");
          }
        } else {
          // Fallback: try to verify using reference only
          const response = await fetch(
            `/api/payment/verify?reference=${paymentReference}`
          );

          if (response.redirected) {
            window.location.href = response.url;
          } else if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setVerificationStatus("success");
              router.push(
                `/payment/success?reference=${paymentReference}&userId=${data.userId}`
              );
            } else {
              setVerificationStatus("failed");
              router.push(`/payment/failed?error=${data.error}`);
            }
          } else {
            setVerificationStatus("failed");
            router.push("/payment/failed?error=verification_failed");
          }
        }
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationStatus("failed");
        router.push("/payment/failed?error=verification_error");
      }
    };

    // Only run verification if we have necessary parameters
    if (transaction_id || tx_ref || reference) {
      verifyPayment();
    } else {
      // No reference found, redirect to failed page
      setVerificationStatus("failed");
      router.push("/payment/failed?error=no_reference");
    }
  }, [transaction_id, tx_ref, status, reference, router]);

  // Show different loading states based on verification status
  const getStatusMessage = () => {
    switch (verificationStatus) {
      case "verifying":
        return {
          message: "Verifying your payment...",
          subMessage: "Please wait while we confirm your transaction.",
          color: "text-yellow-600",
          borderColor: "border-yellow-600"
        };
      case "success":
        return {
          message: "Payment Verified!",
          subMessage: "Redirecting to success page...",
          color: "text-green-600",
          borderColor: "border-green-600"
        };
      case "cancelled":
        return {
          message: "Payment Cancelled",
          subMessage: "Your payment was cancelled.",
          color: "text-orange-600",
          borderColor: "border-orange-600"
        };
      case "failed":
        return {
          message: "Verification Failed",
          subMessage: "Redirecting to failed page...",
          color: "text-red-600",
          borderColor: "border-red-600"
        };
      default:
        return {
          message: "Processing...",
          subMessage: "Please wait a moment.",
          color: "text-gray-600",
          borderColor: "border-gray-600"
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Animated Icon */}
        <div className="mb-6">
          {verificationStatus === "verifying" ? (
            <div className="relative">
              <div className={`w-20 h-20 border-4 ${statusInfo.borderColor} border-t-transparent rounded-full animate-spin mx-auto`}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          ) : verificationStatus === "success" ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : verificationStatus === "failed" || verificationStatus === "cancelled" ? (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏳</span>
            </div>
          )}
        </div>

        {/* Status Message */}
        <h2 className={`text-2xl font-bold ${statusInfo.color} mb-3`}>
          {statusInfo.message}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {statusInfo.subMessage}
        </p>

        {/* Reference Info */}
        {(transaction_id || tx_ref) && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Transaction Reference</p>
            <p className="text-sm font-mono text-gray-800 break-all">
              {transaction_id || tx_ref}
            </p>
          </div>
        )}

        {/* Loading Progress Bar */}
        {verificationStatus === "verifying" && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-yellow-600 h-2 rounded-full animate-pulse"></div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500">
          <p>Do not close this window or refresh the page.</p>
          <p>This process may take a few moments.</p>
        </div>
      </div>
    </div>
  );
}