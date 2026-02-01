"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from "@/stores/cart-store";
import {
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  Tag,
  Clock,
  Check,
  ArrowRight
} from 'lucide-react';
import { ProductReviews } from '@/components/ProductReviews';

// Utility function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Product Image Gallery Component
const ImageGallery = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
        <img
          src={images[selectedImage]}
          alt={productName}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === index 
                  ? 'border-yellow-500 ring-2 ring-yellow-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`${productName} view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Product Variants Component
const VariantSelector = ({ variants, selectedVariant, onVariantChange }) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-4">
      {variants.map((variant, index) => (
        <div key={index} className="space-y-3">
          <h4 className="font-semibold text-gray-900 capitalize">{variant.name}</h4>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option, optionIndex) => {
              const isSelected = selectedVariant[variant.name] === option;
              return (
                <button
                  key={optionIndex}
                  onClick={() => onVariantChange(variant.name, option)}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Related Products Component
const RelatedProducts = ({ products, currentProductId }) => {
  const router = useRouter();

  if (!products || products.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
        <button className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium">
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            onClick={() => router.push(`/product/${product._id}`)}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="aspect-square bg-gray-50 rounded-t-xl overflow-hidden relative">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.featured && (
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </span>
                )}
                {product.flashSale?.active && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {product.flashSale.discountPercentage}% OFF
                  </span>
                )}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                {product.name}
              </h3>
              
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.floor(product.ratings?.average || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">
                  ({product.ratings?.count || 0})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {product.flashSale?.active ? (
                    <>
                      <span className="text-lg font-bold text-red-600">
                        {formatCurrency(product.price * (1 - product.flashSale.discountPercentage / 100))}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-bold text-green-600">
                        ₦{formatCurrency(product.sellingPrice)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ₦{formatCurrency(product.price)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [activeTab, setActiveTab] = useState('description');

  const { addItem, getItemQuantity } = useCartStore();


  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);
          
          // Initialize selected variants
          if (data.product.variants) {
            const initialVariants = {};
            data.product.variants.forEach(variant => {
              initialVariants[variant.name] = variant.options[0];
            });
            setSelectedVariants(initialVariants);
          }
        } else {
          setError(data.error || 'Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Handle variant selection
  const handleVariantChange = (variantName, option) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: option
    }));
  };

  // Handle quantity changes
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem(product, quantity, selectedVariants);
    
    
    // Optional: Open cart slider after adding
    // You might want to pass a ref or use a global state to control the cart slider
  };

  const currentItemQuantity = product ? getItemQuantity(product._id, selectedVariants) : 0;


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😔</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Images */}
          <div>
            <ImageGallery 
              images={product.images} 
              productName={product.name} 
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{product.category?.name}</span>
              <span>•</span>
              <span>{product.section}</span>
            </div>

            {/* Product Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Ratings */}
            {/* <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.floor(product.ratings.average)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {product.ratings.average.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">
                {product.ratings.count} reviews
              </span>
            </div> */}

            {/* Price Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {/* <span className={`text-3xl font-bold ${
                  product.isFlashSaleActive ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatCurrency(product.discountedPrice || product.price)}
                </span> */}
                <>
                  <span className={`text-3xl font-bold ${
                  product.isFlashSaleActive ? 'text-red-600' : 'text-gray-900'
                }`}>
                    {formatCurrency(product.sellingPrice)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(product.price)}
                  </span>
                </>
                
                {product.isFlashSaleActive && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Save {product.flashSale.discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {product.isFlashSaleActive && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <Clock className="w-4 h-4" />
                  <span>Flash sale ends {new Date(product.flashSale.endDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
              isOutOfStock 
                ? 'bg-red-50 text-red-700' 
                : 'bg-green-50 text-green-700'
            }`}>
              <Check className="w-4 h-4" />
              <span className="font-medium">
                {isOutOfStock ? 'Out of Stock' : `${product.stock} items in stock`}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>

            {/* Variants */}
            <VariantSelector
              variants={product.variants}
              selectedVariant={selectedVariants}
              onVariantChange={handleVariantChange}
            />

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-900">Quantity:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-lg font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 bg-yellow-500 text-white py-4 px-8 rounded-xl font-semibold hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-semibold text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over ₦100,000</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-semibold text-gray-900">2-Year Warranty</p>
                  <p className="text-sm text-gray-600">Full protection</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-semibold text-gray-900">Quality Assured</p>
                  <p className="text-sm text-gray-600">Premium quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16 border-t border-gray-200">
          <div className="flex justify-center border-b border-gray-200">
            <div className="flex overflow-x-auto scrollbar-hide max-w-full">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-0 px-3 py-4 font-semibold capitalize border-b-2 transition-colors whitespace-nowrap
                    sm:flex-none sm:px-6
                    ${activeTab === tab
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                    {/* Icons for mobile */}
                    <span className="text-sm sm:hidden">
                      {tab === 'description' && '📝'}
                      {tab === 'specifications' && '📋'}
                      {tab === 'reviews' && '⭐'}
                    </span>
                    {/* Text */}
                    <span className="text-xs sm:text-sm">
                      {tab === 'description' && 'Description'}
                      {tab === 'specifications' && 'Specifications'}
                      {tab === 'reviews' && (
                        <>
                          <span className="hidden sm:inline">Reviews</span>
                          <span className="sm:hidden">Reviews</span>
                        </>
                      )}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'No detailed description available for this product.'}
                </p>
                
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-4">
                {product.variants && product.variants.length > 0 ? (
                  product.variants.map((variant, index) => (
                    <div key={index} className="flex border-b border-gray-100 py-3">
                      <span className="w-48 font-medium text-gray-900 capitalize">{variant.name}:</span>
                      <span className="text-gray-600">{variant.options.join(', ')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-gray-400" />
                </div>
                <ProductReviews productId={productId}/>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts 
          products={relatedProducts} 
          currentProductId={productId} 
        />
      </div>
    </div>
  );
}