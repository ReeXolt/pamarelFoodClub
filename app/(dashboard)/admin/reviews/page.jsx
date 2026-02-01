"use client";
import { useState, useEffect } from 'react';
import { FiSearch, FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

export default function ReviewAdminDashboard() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState([]);

  // Fetch reviews from API
  const fetchReviews = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/reviews?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      if (ratingFilter !== 'all') {
        url += `&rating=${ratingFilter}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
        setTotalPages(data.pagination.totalPages);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error('Error loading reviews', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Load reviews and check mobile status
  useEffect(() => {
    fetchReviews();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentPage, searchQuery, ratingFilter]);

  // Toggle review expansion
  const toggleExpandReview = (id) => {
    if (expandedReviews.includes(id)) {
      setExpandedReviews(expandedReviews.filter(reviewId => reviewId !== id));
    } else {
      setExpandedReviews([...expandedReviews, id]);
    }
  };

  // Expand or collapse all reviews
  const toggleExpandAll = () => {
    if (expandedReviews.length === reviews.length) {
      setExpandedReviews([]); // Collapse all
    } else {
      setExpandedReviews(reviews.map(r => r.id)); // Expand all
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render star rating
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <FiStar 
        key={i} 
        className={`${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Customer Reviews</h1>
            <p className="text-gray-600 mt-1">View all customer product reviews</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
              <span className="text-gray-700 font-medium">{reviews.length}</span>
              <span className="text-gray-500 ml-1">Reviews</span>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search reviews by customer, product or comment..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expand All Button */}
        {reviews.length > 0 && (
          <div className="mb-4">
            <button
              onClick={toggleExpandAll}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
            >
              {expandedReviews.length === reviews.length ? 'Collapse All' : 'Show All Reviews Fully'}
            </button>
          </div>
        )}
        
        {/* Reviews Table/Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {isMobile ? (
              // Mobile Cards View
              <div className="grid grid-cols-1 gap-4 mb-8">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        {/* <img 
                          src={review.product.image} 
                          alt={review.product.name} 
                          className="h-12 w-12 rounded-md object-cover"
                        /> */}
                        <div>
                          <h3 className="font-medium text-gray-900">{review.product.name}</h3>
                          <p className="text-sm text-gray-500">{review.user.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                    </div>
                    
                    <p className="text-gray-700 mb-2">
                      {expandedReviews.includes(review.id) 
                        ? review.comment 
                        : review.comment.length > 100 
                          ? `${review.comment.substring(0, 100)}...` 
                          : review.comment}
                    </p>
                    
                    {review.comment.length > 100 && (
                      <button 
                        onClick={() => toggleExpandReview(review.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm mb-3"
                      >
                        {expandedReviews.includes(review.id) ? 'Read Less' : 'Read More'}
                      </button>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      {review.isVerifiedPurchase ? 'Verified Purchase' : ''}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop Table View
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto mb-8">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {/* <img 
                              src={review.product.image} 
                              alt={review.product.name} 
                              className="h-10 w-10 rounded-md object-cover mr-3"
                            /> */}
                            <div className="font-medium text-gray-900">{review.product.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{review.user.name}</div>
                          <div className="text-xs text-gray-400">{review.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                          <p className={expandedReviews.includes(review.id) ? '' : 'line-clamp-2'}>
                            {review.comment}
                          </p>
                          {review.comment.length > 100 && (
                            <button 
                              onClick={() => toggleExpandReview(review.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm mt-1"
                            >
                              {expandedReviews.includes(review.id) ? 'Read Less' : 'Read More'}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs text-gray-500">
                            {review.isVerifiedPurchase ? 'Verified' : ''}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <FiChevronLeft />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
