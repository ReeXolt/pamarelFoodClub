"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';


const formatPrice = (price) => {
  return price.toLocaleString('en-NG');
};


export function GadgetEssentails() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGadgetEssentials();
  }, []);

  const fetchGadgetEssentials = async () => {
    try {
      const response = await fetch('/api/products/gadget-essentials');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching gadget essentials:', error);
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
      <div id="gadget" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-20 h-1 bg-yellow-500 mx-auto mb-4"></div>
            <h2 className="text-4xl font-bold text-gray-900">Gadget Essentials</h2>
            <p className="text-gray-600 mt-4">Must-have tech for modern living</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-6 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't show if no products found
  if (products.length === 0) {
    return null;
  }

  return (
    <div id="gadget" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-1 bg-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-4xl font-bold text-gray-900">Gadget Essentials</h2>
          <p className="text-gray-600 mt-4 text-lg">Must-have tech for modern living</p>
        </div>

        {/* Products Grid - Always 4 products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => {
            const flashSaleActive = isFlashSaleActive(product);
            const discountedPrice = calculateDiscountedPrice(product);
            
            return (
              <div key={product._id || index} className="group">
                <Link href={`/product/${product._id}`}>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden group-hover:shadow-xl transition-all duration-300 border border-gray-100">
                    {/* Product Image */}
                    <div className="relative h-64 bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      
                      {/* Flash Sale Badge */}
                      {flashSaleActive && (
                        <div className="absolute top-3 left-3">
                          <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            ⚡ {product.flashSale.discountPercentage}% OFF
                          </div>
                        </div>
                      )}

                      {/* Gadget Badge */}
                      <div className="absolute top-3 right-3">
                        <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                          TECH
                        </div>
                      </div>

                      {/* Featured Badge */}
                      {product.featured && (
                        <div className="absolute bottom-3 left-3">
                          <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                            FEATURED
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-3 text-gray-900 group-hover:text-yellow-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {/* <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p> */}

                      {/* Price and Rating */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {flashSaleActive ? (
                            <>
                              <span className="text-xl font-bold text-yellow-600">
                                ₦{formatPrice(discountedPrice)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ₦{formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-xl font-bold text-green-600">
                                ₦{formatPrice(product.sellingPrice)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ₦{formatPrice(product.price)}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* Rating */}
                        {product.ratings?.average > 0 && (
                          <div className="flex items-center space-x-1">
                            <div className="text-yellow-500">★</div>
                            <span className="text-sm text-gray-600">
                              {product.ratings.average.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({product.ratings.count})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stock and Sales Info */}
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          {product.stock > 0 ? (
                            <span className="text-green-600">✓ In Stock</span>
                          ) : (
                            <span className="text-red-600">✗ Out of Stock</span>
                          )}
                        </span>
                        {/* <span>{product.numberSold || 0} sold</span> */}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Link 
            href="/category"
            className="inline-flex items-center px-8 py-3 border-2 border-yellow-500 text-base font-bold rounded-lg text-yellow-600 hover:bg-yellow-500 hover:text-white transition-all duration-200 group"
          >
            Explore More Gadgets
            <svg 
              className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}