"use client";
import { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Truck,
  Edit,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  User,
  Users,
  Repeat2,
  Tag
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';

const statusMap = {
  'pending': { icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  'processing': { icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  'delivered': { icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
  'cancelled': { icon: XCircle, color: 'bg-red-100 text-red-800' },
  'return': { icon: Repeat2, color: 'bg-orange-100 text-orange-800' }
};

const fetcher = (url) => fetch(url).then((res) => res.json());

const formatOrderDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    // Use a consistent format that works on both server and client
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    return 'N/A';
  }
};

const OrderStatusBadge = ({ status }) => {
  const StatusIcon = statusMap[status]?.icon || Clock;
  const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
      <StatusIcon className="mr-1 h-3 w-3" />
      {status}
    </span>
  );
};

const CustomerTypeBadge = ({ isMlm }) => {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      isMlm ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {isMlm ? (
        <>
          <Users className="mr-1 h-3 w-3" />
          MLM Member
        </>
      ) : (
        <>
          <User className="mr-1 h-3 w-3" />
          Customer
        </>
      )}
    </span>
  );
};

const LevelIndicator = ({ level }) => {
  if (!level) return null;
  return (
    <div className="flex items-center mt-1 text-xs text-gray-500">
      <span className="mr-1">Level:</span>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full mx-0.5 ${i < level ? 'bg-purple-600' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
};

const VariantDisplay = ({ variants }) => {
  if (!variants || Object.keys(variants).length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-1">
        {Object.entries(variants).map(([key, value]) => (
          <span 
            key={key} 
            className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 text-xs font-medium"
          >
            <Tag className="h-3 w-3 mr-1" />
            {key}: {value}
          </span>
        ))}
      </div>
    </div>
  );
};

const OrderDetailsModal = ({ order, onClose, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: order.orderStatus,
    notes: ''
  });

  const statusOptions = [
    { name: 'pending', label: 'Pending', icon: Clock },
    { name: 'processing', label: 'Processing', icon: Clock },
    { name: 'delivered', label: 'Delivered', icon: CheckCircle2 },
    { name: 'cancelled', label: 'Cancelled', icon: XCircle }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order._id,
          status: formData.status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      const updatedOrder = await response.json();
      onUpdate(updatedOrder);
      setEditing(false);
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">Order #{order._id.toString().slice(-6).toUpperCase()}</h2>
              <p className="text-sm text-gray-500">
                Placed on {formatOrderDate(order.createdAt)}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900">Customer Information</h3>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{order.user?.username || 'N/A'}</p>
                  <CustomerTypeBadge isMlm={!!order.user?.referralCode} />
                </div>
                <p className="text-gray-500">{order.user?.email || 'N/A'}</p>
                {order.user?.referralCode && (
                  <>
                    <p className="text-gray-500">Member ID: {order.user.referralCode}</p>
                    {/* You can add level indicator if available */}
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Shipping Information</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>{order.shippingInfo.address}</p>
                <p className="text-gray-500">{order.shippingInfo.city}, {order.shippingInfo.zip}</p>
                <p className="text-gray-500">{order.shippingInfo.email}</p>
                <p className="text-gray-500">{order.deliveryMethod} Shipping</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-gray-900">Order Items</h3>
            <div className="mt-4 border rounded-lg divide-y">
              {order.items.map((item, index) => (
                <div key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                      
                      {/* Display variants if available */}
                      <VariantDisplay variants={item.selectedVariants} />
                      
                      {/* Display variant SKU if available */}
                      {item.variantSku && (
                        <p className="text-xs text-gray-400 mt-1">
                          SKU: {item.variantSku}
                        </p>
                      )}
                    </div>
                    <p className="font-medium ml-4">
                      {new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: 'NGN'
                      }).format(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-gray-900">Order Status</h3>
            <div className="mt-2">
              {editing ? (
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  {statusOptions.map(option => (
                    <option key={option.name} value={option.name}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <OrderStatusBadge status={order.orderStatus} />
              )}
            </div>
          </div>

          {/* {order.user.referralCode && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900">MLM Commission</h3>
              <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-purple-800">Earned Commission</p>
                    <p className="text-xs text-purple-600">10% of product value</p>
                  </div>
                  <p className="text-lg font-bold text-purple-800">
                    {new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN'
                    }).format(order.subtotal * 0.1)}
                  </p>
                </div>
              </div>
            </div>
          )} */}

          <div className="mt-6">
            <h3 className="font-medium text-gray-900">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN'
                  }).format(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN'
                  }).format(order.deliveryPrice)}
                </span>
              </div>
              {/* {order.user.referralCode && (
                <div className="flex justify-between">
                  <span className="text-gray-500">MLM Commission</span>
                  <span className="text-purple-600">
                    -{new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN'
                    }).format(order.subtotal * 0.1)}
                  </span>
                </div>
              )} */}
              {order.walletBalanceUsed > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Wallet Used</span>
                  <span className="text-purple-600">
                    -{new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN'
                    }).format(order.walletBalanceUsed)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-medium border-t pt-2 mt-1">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN'
                  }).format(order.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 flex items-center gap-2 border rounded-md text-sm font-medium"
                >
                  <Edit className="h-4 w-4" />
                  Update Status
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    pages.push(1);
    
    // Show ellipsis if current page is far from start
    if (currentPage > maxVisiblePages - 1) {
      pages.push('...');
    }
    
    // Calculate start and end pages
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust if we're near the start or end
    if (currentPage <= maxVisiblePages - 1) {
      endPage = maxVisiblePages;
    } else if (currentPage >= totalPages - (maxVisiblePages - 2)) {
      startPage = totalPages - (maxVisiblePages - 1);
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }
    
    // Show ellipsis if current page is far from end
    if (currentPage < totalPages - (maxVisiblePages - 2)) {
      pages.push('...');
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * 10, totalPages * 10)}</span> of{' '}
            <span className="font-medium">{totalPages * 10}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                >
                  <Ellipsis className="h-5 w-5" />
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    currentPage === page
                      ? 'bg-yellow-600 text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-yellow-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

const ProductWithVariants = ({ item }) => {
  return (
    <div>
      <div className="text-sm text-gray-900">
        {item.name}
      </div>
      <div className="text-xs text-gray-500">
        {item.product?.category || 'Product'} • Qty: {item.quantity}
      </div>
      
      {/* Display variants in table view */}
      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
        <div className="mt-1">
          <div className="flex flex-wrap gap-1">
            {Object.entries(item.selectedVariants).map(([key, value]) => (
              <span 
                key={key} 
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-600 text-xs"
              >
                {key}: {value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Orders() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');
  const page = searchParams.get('page') || 1;
  const searchTerm = searchParams.get('search') || '';
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Fetch orders data
  const { data: ordersData, error, isLoading } = useSWR(
    `/api/admin/orders?status=${statusFilter || 'all'}&page=${page}&search=${searchTerm}`,
    fetcher
  );
  
  // Fetch status counts
  const { data: statusCounts } = useSWR(
    '/api/admin/orders/stats',
    fetcher
  );
  
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  
  const handleUpdateOrder = (updatedOrder) => {
    // In a real app, we would update the SWR cache here
    // For now, we'll just close the modal and let SWR revalidate
    setIsModalOpen(false);
    // You might want to trigger a revalidation here
  };
  
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleSearch = (term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
      params.set('page', 1); // Reset to first page when searching
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`);
  };
  
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    // Note: Sorting is currently handled client-side
    // For large datasets, you'd want to pass this to the API
  };
  
  // Sort the data client-side (for small datasets)
  const sortedOrders = ordersData?.data ? [...ordersData.data].sort((a, b) => {
    if (sortConfig.key) {
      // Handle nested properties
      const keyParts = sortConfig.key.split('.');
      let valueA = a;
      let valueB = b;
      
      for (const part of keyParts) {
        valueA = valueA[part];
        valueB = valueB[part];
      }
      
      if (valueA < valueB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  }) : [];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">MLM Orders Management</h1>
          <p className="text-gray-500">
            {statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Orders` : 'All Orders'}
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 w-full border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            defaultValue={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <a
            href="/admin/orders"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              !statusFilter
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Orders
          </a>
          <a
            href="/admin/orders?status=pending"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'pending'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending {statusCounts?.pending > 0 && (
              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {statusCounts.pending}
              </span>
            )}
          </a>
          <a
            href="/admin/orders?status=processing"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'processing'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Processing {statusCounts?.processing > 0 && (
              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {statusCounts.processing}
              </span>
            )}
          </a>
          <a
            href="/admin/orders?status=delivered"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'delivered'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Delivered {statusCounts?.delivered > 0 && (
              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {statusCounts.delivered}
              </span>
            )}
          </a>
          <a
            href="/admin/orders?status=cancelled"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'cancelled'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cancelled {statusCounts?.cancelled > 0 && (
              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {statusCounts.cancelled}
              </span>
            )}
          </a>
          <a
            href="/admin/orders?status=return"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              statusFilter === 'return'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Return {statusCounts?.return > 0 && (
              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {statusCounts.return}
              </span>
            )}
          </a>
        </nav>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          Failed to load orders. Please try again.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('_id')}
                  >
                    <div className="flex items-center">
                      Order ID
                      {sortConfig.key === '_id' && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortConfig.key === 'createdAt' && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('user.firstName')}
                  >
                    <div className="flex items-center">
                      Customer
                      {sortConfig.key === 'user.firstName' && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product & Variants
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('total')}
                  >
                    <div className="flex items-center">
                      Total
                      {sortConfig.key === 'total' && (
                        sortConfig.direction === 'asc' ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.length > 0 ? (
                  sortedOrders.map((order) => (
                    <tr 
                      key={order._id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleOrderClick(order)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-yellow-600">
                          {order._id.toString().slice(-6).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatOrderDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {order.user?.username || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">{order.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CustomerTypeBadge isMlm={!!order.user?.referralCode} />
                      </td>
                      <td className="px-6 py-4">
                        <ProductWithVariants item={order.items[0]} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {new Intl.NumberFormat('en-NG', {
                            style: 'currency',
                            currency: 'NGN'
                          }).format(order.total)}
                        </div>
                        {order.user?.referralCode && (
                          <div className="text-xs text-purple-600">
                            +{new Intl.NumberFormat('en-NG', {
                              style: 'currency',
                              currency: 'NGN'
                            }).format(order.subtotal * 0.1)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatusBadge status={order.orderStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderClick(order);
                          }}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {ordersData && (
            <Pagination 
              currentPage={ordersData.page} 
              totalPages={ordersData.pages} 
              onPageChange={handlePageChange} 
            />
          )}
        </div>
      )}

      {isModalOpen && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateOrder}
        />
      )}
    </div>
  );
}