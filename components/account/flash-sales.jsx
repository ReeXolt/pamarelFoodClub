"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';


const formatPrice = (price) => {
  return price.toLocaleString('en-NG');
};


export function FlashSales() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchFlashSales();
    
    // Update current time every second for countdown
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchFlashSales = async () => {
    try {
      const response = await fetch('/api/products/flash-sales');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching flash sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeLeft = (endDate) => {
    const end = new Date(endDate);
    const difference = end - currentTime;
    
    if (difference <= 0) {
      return { expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      expired: false
    };
  };

  const calculateDiscountedPrice = (product) => {
    if (product.flashSale?.discountPercentage > 0) {
      const discount = product.price * (product.flashSale.discountPercentage / 100);
      return product.price - discount;
    }
    return product.price;
  };

  const formatTimeUnit = (value) => {
    return value < 10 ? `0${value}` : value;
  };

  const CountdownTimer = ({ endDate }) => {
    const timeLeft = calculateTimeLeft(endDate);

    if (timeLeft.expired) {
      return (
        <div className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">
          Expired
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 bg-yellow-500 text-white px-3 py-2 rounded-lg">
        <div className="text-center">
          <div className="text-xs font-semibold">HRS</div>
          <div className="text-lg font-bold">{formatTimeUnit(timeLeft.hours)}</div>
        </div>
        <div className="text-yellow-500 font-bold">:</div>
        <div className="text-center">
          <div className="text-xs font-semibold">MINS</div>
          <div className="text-lg font-bold">{formatTimeUnit(timeLeft.minutes)}</div>
        </div>
        <div className="text-yellow-500 font-bold">:</div>
        <div className="text-center">
          <div className="text-xs font-semibold">SECS</div>
          <div className="text-lg font-bold">{formatTimeUnit(timeLeft.seconds)}</div>
        </div>
      </div>
    );
  };

  // Don't show anything if no flash sales
  if (!loading && products.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Flash Sales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Countdown */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="text-center lg:text-left mb-6 lg:mb-0">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-2">
              <div className="w-5 h-10 bg-yellow-500 rounded"></div>
              <h2 className="text-2xl font-bold text-yellow-600">Today's</h2>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Flash Sales</h1>
          </div>
          
          {/* Global Countdown - shows the earliest ending flash sale */}
          {products.length > 0 && (
            <div className="flex items-center justify-center lg:justify-end space-x-4">
              <div className="text-gray-600 font-semibold">Ending in:</div>
              <CountdownTimer endDate={products[0].flashSale.endDate} />
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {products.map((product) => {
            const discountedPrice = calculateDiscountedPrice(product);
            const timeLeft = calculateTimeLeft(product.flashSale.endDate);
            const savings = product.price - discountedPrice;

            return (
              <div key={product._id} className="group">
                <Link href={`/products/${product._id}`}>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden group-hover:shadow-xl transition-all duration-300 border-2 border-yellow-200">
                    {/* Product Image */}
                    <div className="relative h-64 bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      
                      {/* Flash Sale Badge */}
                      <div className="absolute top-3 left-3">
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          ⚡ {product.flashSale.discountPercentage}% OFF
                        </div>
                      </div>

                      {/* Individual Product Countdown */}
                      {!timeLeft.expired && (
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg">
                            <div className="flex justify-between text-xs">
                              <span>Ends in:</span>
                              <span className="font-bold">
                                {formatTimeUnit(timeLeft.hours)}:
                                {formatTimeUnit(timeLeft.minutes)}:
                                {formatTimeUnit(timeLeft.seconds)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sold Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-1">
                        <div 
                          className="bg-yellow-500 h-1 transition-all duration-500"
                          style={{ 
                            width: `${Math.min((product.numberSold / (product.stock + product.numberSold)) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-yellow-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-yellow-600">
                            ₦{formatPrice(discountedPrice)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ₦{formatPrice(product.price)}
                          </span>
                        </div>
                        <div className="text-xs text-green-600 font-semibold">
                          Save ₦{formatPrice(savings)}
                        </div>
                      </div>

                      {/* Progress Text */}
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Sold: {product.numberSold}</span>
                        <span>Available: {product.stock}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* View All Flash Sales Button */}
        {products.length > 0 && (
          <div className="text-center mt-12">
            <Link 
              href="/category"
              className="inline-flex items-center px-8 py-4 border-2 border-yellow-500 text-lg font-bold rounded-lg text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all duration-200"
            >
              View All Flash Sales
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}