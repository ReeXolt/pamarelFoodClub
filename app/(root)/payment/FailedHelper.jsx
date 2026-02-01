"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentFailed() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    switch (error) {
      case "no_reference":
        return "No payment reference was provided.";
      case "verification_failed":
        return "Payment verification failed. Please contact support.";
      case "payment_failed":
        return "Your payment was not successful. Please try again.";
      case "invalid_metadata":
        return "Invalid payment metadata. Please contact support.";
      case "invalid_plan":
        return "The selected plan is invalid. Please contact support.";
      case "user_not_found":
        return "User account not found. Please contact support.";
      case "server_error":
        return "A server error occurred. Please contact support.";
      default:
        return "Your payment failed. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 relative">
            <img
              src="/pamarel-logo.jpeg"
              alt="Pamarel Logo"
              className="object-contain"
            />
          </div>
        </div>

        {/* Error Message */}
        <div className="bg-white p-6 rounded-2xl shadow-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800 text-sm">{getErrorMessage()}</p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/join-member"
              className="w-full flex justify-center py-2 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
