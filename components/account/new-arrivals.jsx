"use client"

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const formatPrice = (price) => {
  return price.toLocaleString('en-NG');
};


export function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      const response = await fetch('/api/products/new-arrivals');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = (product) => {
    if (product.flashSale?.active && product.flashSale.discountPercentage > 0) {
      const discount = product.price * (product.flashSale.discountPercentage / 100);
      return product.price - discount;
    }
    return product.price;
  };

  const isFlashSaleActive = (product) => {
    if (!product.flashSale?.active) return false;
    
    const now = new Date();
    const startDate = new Date(product.flashSale.startDate);
    const endDate = new Date(product.flashSale.endDate);
    
    return now >= startDate && now <= endDate;
  };

  if (loading) {
    return (
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">New Arrivals</h2>
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
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">New Arrivals</h2>
          <p className="text-gray-600 mb-8">Discover our latest products</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const flashSaleActive = isFlashSaleActive(product);
              const discountedPrice = calculateDiscountedPrice(product);
              
              return (
                <div key={product._id} className="group">
                  <Link href={`/product/${product._id}`}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                      {/* Product Image */}
                      <div className="relative h-64 bg-gray-100">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                        
                        {/* Flash Sale Badge */}
                        {flashSaleActive && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-bold">
                            {product.flashSale.discountPercentage}% OFF
                          </div>
                        )}
                        
                        {/* New Arrival Badge */}
                        <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded text-xs font-bold">
                          NEW
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 text-left text-gray-900 group-hover:text-yellow-600 transition-colors">
                          {product.name}
                        </h3>
                        
                        {/* <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p> */}

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {flashSaleActive ? (
                              <>
                                <span className="text-lg font-bold text-yellow-600">
                                  ₦{formatPrice(discountedPrice)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ₦{formatPrice(product.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">
                                ₦{formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                          
                          {/* Rating */}
                          {product.ratings?.average > 0 && (
                            <div className="flex items-center space-x-1">
                              <div className="text-yellow-500">★</div>
                              <span className="text-sm text-gray-600">
                                {product.ratings.average.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Stock Status */}
                        <div className="mt-2">
                          {product.stock > 0 ? (
                            <span className="text-green-600 text-sm">In Stock</span>
                          ) : (
                            <span className="text-red-600 text-sm">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* View All Button */}
          <div className="mt-12">
            <Link 
              href="/category"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 transition-colors duration-200"
            >
              View All Products
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}