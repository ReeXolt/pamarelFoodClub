"use client";
import { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiTrash2, 
  FiEdit2, 
  FiChevronLeft, 
  FiChevronRight,
  FiSearch,
  FiCopy,
  FiPercent,
  FiDollarSign,
  FiCalendar,
  FiTag,
  FiX,
  FiCheck
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 8;

// Generate dummy products
const generateDummyProducts = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `prod_${i + 1}`,
    name: `Product ${i + 1}`,
    price: Math.floor(Math.random() * 50000) + 5000, // Prices in Naira (₦5,000 to ₦55,000)
    category: ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'][Math.floor(Math.random() * 5)],
    image: `https://picsum.photos/200/200?random=${i}`
  }));
};

// Generate dummy coupons
const generateDummyCoupons = () => {
  const types = ['percentage', 'fixed', 'free_shipping'];
  const statuses = ['active', 'expired', 'scheduled', 'disabled'];
  
  return Array.from({ length: 15 }, (_, i) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) + 7);
    
    return {
      id: `coupon_${i + 1}`,
      code: `DISCOUNT${Math.floor(Math.random() * 9000) + 1000}`,
      type: types[Math.floor(Math.random() * types.length)],
      value: types[Math.floor(Math.random() * types.length)] === 'percentage' 
        ? Math.floor(Math.random() * 50) + 5 
        : Math.floor(Math.random() * 10000) + 1000, // Values in Naira (₦1,000 to ₦11,000)
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      minPurchase: Math.floor(Math.random() * 10000),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      usageLimit: Math.floor(Math.random() * 100) + 10,
      usedCount: Math.floor(Math.random() * 50),
      products: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
        `prod_${Math.floor(Math.random() * 20) + 1}`
      ),
      description: `Special discount ${i + 1} for selected products`
    };
  });
};

export default function CouponsDisplays() {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minPurchase: 0,
    status: 'active',
    usageLimit: 100,
    products: [],
    description: ''
  });

  // Load dummy data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProducts(generateDummyProducts());
      const couponData = generateDummyCoupons();
      setCoupons(couponData);
      setFilteredCoupons(couponData);
      setLoading(false);
    }, 800);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...coupons];
    
    if (searchQuery) {
      result = result.filter(coupon => 
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(coupon => coupon.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      result = result.filter(coupon => coupon.type === typeFilter);
    }
    
    setFilteredCoupons(result);
    setCurrentPage(1);
  }, [coupons, searchQuery, statusFilter, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE);
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const leftBound = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const rightBound = Math.min(totalPages, leftBound + maxVisiblePages - 1);
    
    if (leftBound > 1) {
      items.push(1);
      if (leftBound > 2) items.push('...');
    }
    
    for (let i = leftBound; i <= rightBound; i++) {
      items.push(i);
    }
    
    if (rightBound < totalPages) {
      if (rightBound < totalPages - 1) items.push('...');
      items.push(totalPages);
    }
    
    return items;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle product selection
  const handleProductSelect = (productId) => {
    setFormData(prev => {
      if (prev.products.includes(productId)) {
        return { ...prev, products: prev.products.filter(id => id !== productId) };
      } else {
        return { ...prev, products: [...prev.products, productId] };
      }
    });
  };

  // Generate random coupon code
  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  // Copy coupon code
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
  };

  // Submit coupon
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentCoupon) {
      // Update existing coupon
      setCoupons(coupons.map(coupon => 
        coupon.id === currentCoupon.id ? { ...formData, id: currentCoupon.id } : coupon
      ));
      toast.success('Coupon updated successfully');
    } else {
      // Add new coupon
      const newCoupon = { ...formData, id: `coupon_${coupons.length + 1}`, usedCount: 0 };
      setCoupons([...coupons, newCoupon]);
      toast.success('Coupon created successfully');
    }
    
    setShowForm(false);
    setCurrentCoupon(null);
  };

  // Edit coupon
  const handleEdit = (coupon) => {
    setCurrentCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      minPurchase: coupon.minPurchase,
      status: coupon.status,
      usageLimit: coupon.usageLimit,
      products: [...coupon.products],
      description: coupon.description
    });
    setShowForm(true);
  };

  // Delete coupon
  const handleDelete = (id) => {
    setCoupons(coupons.filter(coupon => coupon.id !== id));
    toast.success('Coupon deleted successfully');
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'disabled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type label
  const getTypeLabel = (type) => {
    switch (type) {
      case 'percentage': return 'Percentage';
      case 'fixed': return 'Fixed Amount (₦)';
      case 'free_shipping': return 'Free Shipping';
      default: return type;
    }
  };

  // Get value display
  const getValueDisplay = (coupon) => {
    switch (coupon.type) {
      case 'percentage': return `${coupon.value}%`;
      case 'fixed': return `₦${coupon.value.toLocaleString()}`;
      case 'free_shipping': return 'Free Shipping';
      default: return coupon.value;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Coupon Management</h1>
            <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
          </div>
          <button 
            onClick={() => {
              setCurrentCoupon(null);
              setFormData({
                code: '',
                type: 'percentage',
                value: 10,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                minPurchase: 0,
                status: 'active',
                usageLimit: 100,
                products: [],
                description: ''
              });
              setShowForm(true);
            }}
            className="mt-4 md:mt-0 flex items-center bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            Create Coupon
          </button>
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
                placeholder="Search coupons by code or description..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
                <option value="disabled">Disabled</option>
              </select>
              
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount (₦)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coupons List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <>
            {filteredCoupons.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
                <h3 className="text-lg font-medium text-gray-900">No coupons found</h3>
                <p className="text-gray-500 mt-2">Create your first coupon to get started</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                {!isMobile && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto mb-8">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedCoupons.map((coupon) => (
                          <tr key={coupon.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="font-mono font-medium">{coupon.code}</span>
                                <button 
                                  onClick={() => copyCode(coupon.code)}
                                  className="ml-2 text-gray-400 hover:text-yellow-500"
                                  title="Copy code"
                                >
                                  <FiCopy size={16} />
                                </button>
                              </div>
                              <div className="text-sm text-gray-500">{coupon.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getTypeLabel(coupon.type)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {getValueDisplay(coupon)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(coupon.status)}`}>
                                {coupon.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>{formatDate(coupon.startDate)}</div>
                              <div>to {formatDate(coupon.endDate)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>{coupon.usedCount} / {coupon.usageLimit}</div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-yellow-500 h-1.5 rounded-full" 
                                  style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                                ></div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {coupon.products.length > 0 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {coupon.products.length} products
                                </span>
                              ) : (
                                <span className="text-gray-400">All products</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit(coupon)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  onClick={() => handleDelete(coupon.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Mobile Cards View */}
                {isMobile && (
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    {paginatedCoupons.map((coupon) => (
                      <div key={coupon.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <span className="font-mono font-medium">{coupon.code}</span>
                            <button 
                              onClick={() => copyCode(coupon.code)}
                              className="ml-2 text-gray-400 hover:text-yellow-500"
                            >
                              <FiCopy size={16} />
                            </button>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(coupon.status)}`}>
                            {coupon.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-gray-400">Type</p>
                            <p className="text-sm">{getTypeLabel(coupon.type)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Value</p>
                            <p className="text-sm font-medium">{getValueDisplay(coupon)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Start Date</p>
                            <p className="text-sm">{formatDate(coupon.startDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">End Date</p>
                            <p className="text-sm">{formatDate(coupon.endDate)}</p>
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <p className="text-xs text-gray-400">Usage</p>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>{coupon.usedCount} / {coupon.usageLimit}</span>
                            <span className="text-gray-500">
                              {Math.round((coupon.usedCount / coupon.usageLimit) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-yellow-500 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3">
                          <div>
                            {coupon.products.length > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                {coupon.products.length} products
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">All products</span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(coupon)}
                              className="text-yellow-600 hover:text-yellow-800"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {filteredCoupons.length > ITEMS_PER_PAGE && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-500">
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredCoupons.length)} of {filteredCoupons.length} coupons
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        <FiChevronLeft />
                      </button>
                      
                      {getPaginationItems().map((item, index) => (
                        item === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setCurrentPage(item)}
                            className={`w-10 h-10 flex items-center justify-center rounded-md ${currentPage === item ? 'bg-yellow-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                          >
                            {item}
                          </button>
                        )
                      ))}
                      
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
          </>
        )}
      </div>

      {/* Coupon Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-xl font-semibold text-gray-800">
                    {currentCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h3>
                <button 
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                    <FiX size={24} />
                </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-800">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Coupon Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                        <div className="flex">
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            placeholder="e.g. SUMMER20"
                            required
                        />
                        <button
                            type="button"
                            onClick={generateCode}
                            className="bg-gray-100 hover:bg-gray-200 px-3 rounded-r-lg border border-l-0 border-gray-300 flex items-center"
                            title="Generate random code"
                        >
                            <FiCopy className="text-gray-600" />
                        </button>
                        </div>
                    </div>
                    
                    {/* Discount Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                        <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        required
                        >
                        <option value="percentage">Percentage Discount</option>
                        <option value="fixed">Fixed Amount Discount (₦)</option>
                        <option value="free_shipping">Free Shipping</option>
                        </select>
                    </div>
                    </div>
                    
                    {/* Discount Value */}
                    {formData.type !== 'free_shipping' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {formData.type === 'percentage' ? 'Discount Percentage *' : 'Discount Amount (₦) *'}
                        </label>
                        <div className="relative">
                            <input
                            type="number"
                            name="value"
                            min="1"
                            max={formData.type === 'percentage' ? '100' : '100000'}
                            value={formData.value}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            required
                            />
                            <span className="absolute right-3 top-2.5 text-gray-400">
                            {formData.type === 'percentage' ? <FiPercent size={18} /> : '₦'}
                            </span>
                        </div>
                        </div>
                        
                        {/* Minimum Purchase */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Purchase (₦)</label>
                        <div className="relative">
                            <input
                            type="number"
                            name="minPurchase"
                            min="0"
                            value={formData.minPurchase}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                            <span className="absolute right-3 top-2.5">₦</span>
                        </div>
                        </div>
                    </div>
                    )}
                    
                    {/* Description */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Describe the purpose of this coupon"
                    />
                    </div>
                </div>
                
                {/* Validity Section */}
                <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-800">Validity</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                        <div className="relative">
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            required
                        />
                        <FiCalendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>
                    
                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                        <div className="relative">
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            required
                        />
                        <FiCalendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>
                    </div>
                    
                    {/* Status & Usage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                        <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        required
                        >
                        <option value="active">Active</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="disabled">Disabled</option>
                        </select>
                    </div>
                    
                    {/* Usage Limit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit *</label>
                        <input
                        type="number"
                        name="usageLimit"
                        min="1"
                        value={formData.usageLimit}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        required
                        />
                    </div>
                    </div>
                </div>
                
                {/* Product Restrictions Section */}
                <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-800">Product Restrictions</h4>
                    <p className="text-sm text-gray-600">
                    Select specific products this coupon applies to. Leave empty to apply to all products.
                    </p>
                    
                    <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {products.map(product => (
                            <div 
                            key={product.id} 
                            onClick={() => handleProductSelect(product.id)}
                            className={`p-2 border rounded-lg cursor-pointer transition-colors flex items-center ${
                                formData.products.includes(product.id) 
                                ? 'border-yellow-500 bg-yellow-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            >
                            <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mr-3 ${
                                formData.products.includes(product.id)
                                ? 'bg-yellow-500 border-yellow-500 text-white'
                                : 'bg-white border-gray-300'
                            }`}>
                                {formData.products.includes(product.id) && <FiCheck size={14} />}
                            </div>
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="h-10 w-10 rounded-md object-cover mr-3"
                            />
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                <p className="text-xs text-gray-500">₦{product.price.toLocaleString()} • {product.category}</p>
                            </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-4">No products available</p>
                    )}
                    </div>
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                    Cancel
                    </button>
                    <button
                    type="submit"
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                    >
                    {currentCoupon ? 'Update Coupon' : 'Create Coupon'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        </div>
        )}
    </div>
  );
}