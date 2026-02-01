"use client";
import { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function PaymentSuccess() {
  useEffect(() => {
    // Fire confetti when page loads
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#FACC15", "#FDE047", "#FBBF24"], // yellow shades
    });
  }, []);

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

        {/* Success Message */}
        <div className="bg-white p-6 rounded-2xl shadow-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful 🎉
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Your payment has been confirmed. Welcome to <span className="text-yellow-600 font-semibold">Pamarel</span>!
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="w-full flex justify-center py-2 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none"
            >
              Sign In to Your Account
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
