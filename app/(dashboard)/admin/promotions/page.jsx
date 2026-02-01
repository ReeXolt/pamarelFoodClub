"use client";
import { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiTrash2, 
  FiEdit2, 
  FiChevronLeft, 
  FiChevronRight,
  FiSearch,
  FiImage,
  FiLink,
  FiCalendar,
  FiPercent,
  FiDollarSign,
  FiX
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 5;

// Generate dummy products for linking
const generateDummyProducts = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `prod_${i + 1}`,
    name: `Product ${i + 1}`,
    price: Math.floor(Math.random() * 50000) + 1000,
    category: ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'][Math.floor(Math.random() * 5)],
    image: `https://picsum.photos/200/200?random=${i}`
  }));
};

// Generate dummy promotions data
const generateDummyPromotions = () => {
  const types = ['banner', 'discount', 'flash_sale', 'category_offer'];
  const statuses = ['active', 'scheduled', 'expired', 'draft'];
  
  return Array.from({ length: 12 }, (_, i) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) + 1);
    
    return {
      id: `promo_${i + 1}`,
      title: `Promotion ${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      image: `https://picsum.photos/800/400?random=${i}`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      discount: Math.floor(Math.random() * 70) + 10,
      link: `/promotions/promo-${i + 1}`,
      products: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => 
        Math.floor(Math.random() * 20) + 1
      ).map(num => `prod_${num}`),
      description: `This is a detailed description of promotion ${i + 1} explaining all the terms and conditions.`
    };
  });
};

export default function DashboardPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'banner',
    status: 'draft',
    image: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    discount: 10,
    link: '',
    products: [],
    description: ''
  });

  // Load dummy data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProducts(generateDummyProducts());
      const promoData = generateDummyPromotions();
      setPromotions(promoData);
      setFilteredPromotions(promoData);
      setLoading(false);
    }, 1000);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...promotions];
    
    if (searchQuery) {
      result = result.filter(promo => 
        promo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promo.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(promo => promo.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      result = result.filter(promo => promo.type === typeFilter);
    }
    
    setFilteredPromotions(result);
    setCurrentPage(1);
  }, [promotions, searchQuery, statusFilter, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPromotions.length / ITEMS_PER_PAGE);
  const paginatedPromotions = filteredPromotions.slice(
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

  // Submit promotion
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentPromo) {
      // Update existing promotion
      setPromotions(promotions.map(promo => 
        promo.id === currentPromo.id ? { ...formData, id: currentPromo.id } : promo
      ));
      toast.success('Promotion updated successfully');
    } else {
      // Add new promotion
      const newPromo = { ...formData, id: `promo_${promotions.length + 1}` };
      setPromotions([...promotions, newPromo]);
      toast.success('Promotion created successfully');
    }
    
    setShowForm(false);
    setCurrentPromo(null);
  };

  // Edit promotion
  const handleEdit = (promo) => {
    setCurrentPromo(promo);
    setFormData({
      title: promo.title,
      type: promo.type,
      status: promo.status,
      image: promo.image,
      startDate: promo.startDate,
      endDate: promo.endDate,
      discount: promo.discount,
      link: promo.link,
      products: [...promo.products],
      description: promo.description
    });
    setShowForm(true);
  };

  // Delete promotion
  const handleDelete = (id) => {
    setPromotions(promotions.filter(promo => promo.id !== id));
    toast.success('Promotion deleted successfully');
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
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type label
  const getTypeLabel = (type) => {
    switch (type) {
      case 'banner': return 'Banner Ad';
      case 'discount': return 'Product Discount';
      case 'flash_sale': return 'Flash Sale';
      case 'category_offer': return 'Category Offer';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Promotions Dashboard</h1>
            <p className="text-gray-600 mt-1">Create and manage promotional campaigns</p>
          </div>
          <button 
            onClick={() => {
              setCurrentPromo(null);
              setFormData({
                title: '',
                type: 'banner',
                status: 'draft',
                image: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                discount: 10,
                link: '',
                products: [],
                description: ''
              });
              setShowForm(true);
            }}
            className="mt-4 md:mt-0 flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            Create Promotion
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
                placeholder="Search promotions by title or description..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
                <option value="draft">Draft</option>
              </select>
              
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="banner">Banner Ad</option>
                <option value="discount">Product Discount</option>
                <option value="flash_sale">Flash Sale</option>
                <option value="category_offer">Category Offer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Promotions List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {filteredPromotions.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
                <h3 className="text-lg font-medium text-gray-900">No promotions found</h3>
                <p className="text-gray-500 mt-2">Create your first promotion to get started</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                {!isMobile && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto mb-8">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promotion</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedPromotions.map((promo) => (
                          <tr key={promo.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-16 rounded-md overflow-hidden">
                                  <img className="h-full w-full object-cover" src={promo.image} alt={promo.title} />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{promo.title}</div>
                                  <div className="text-sm text-gray-500 line-clamp-1">{promo.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getTypeLabel(promo.type)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(promo.status)}`}>
                                {promo.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>{formatDate(promo.startDate)}</div>
                              <div>to {formatDate(promo.endDate)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {promo.discount}%
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {promo.products.length} products
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEdit(promo)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  onClick={() => handleDelete(promo.id)}
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
                    {paginatedPromotions.map((promo) => (
                      <div key={promo.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{promo.title}</h3>
                            <p className="text-sm text-gray-500">{getTypeLabel(promo.type)}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(promo.status)}`}>
                            {promo.status}
                          </span>
                        </div>
                        
                        <div className="mb-4 rounded-md overflow-hidden">
                          <img className="w-full h-32 object-cover" src={promo.image} alt={promo.title} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-400">Start Date</p>
                            <p className="text-sm">{formatDate(promo.startDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">End Date</p>
                            <p className="text-sm">{formatDate(promo.endDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Discount</p>
                            <p className="text-sm font-medium">{promo.discount}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Products</p>
                            <p className="text-sm">{promo.products.length}</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{promo.description}</p>
                        
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(promo)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(promo.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {filteredPromotions.length > ITEMS_PER_PAGE && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-500">
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPromotions.length)} of {filteredPromotions.length} promotions
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
                            className={`w-10 h-10 flex items-center justify-center rounded-md ${currentPage === item ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
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

      {/* Promotion Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentPromo ? 'Edit Promotion' : 'Create New Promotion'}
                </h3>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="banner">Banner Ad</option>
                        <option value="discount">Product Discount</option>
                        <option value="flash_sale">Flash Sale</option>
                        <option value="category_offer">Category Offer</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="active">Active</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://example.com/image.jpg"
                          required
                        />
                        <span className="ml-2 text-gray-400">
                          <FiImage size={20} />
                        </span>
                      </div>
                      {formData.image && (
                        <div className="mt-2">
                          <img 
                            src={formData.image} 
                            alt="Preview" 
                            className="h-24 w-full object-contain border rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <div className="flex items-center">
                          <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <span className="ml-2 text-gray-400">
                            <FiCalendar size={18} />
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <div className="flex items-center">
                          <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <span className="ml-2 text-gray-400">
                            <FiCalendar size={18} />
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="discount"
                          min="1"
                          max="100"
                          value={formData.discount}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <span className="ml-2 text-gray-400">
                          <FiPercent size={18} />
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          name="link"
                          value={formData.link}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="/promotions/summer-sale"
                        />
                        <span className="ml-2 text-gray-400">
                          <FiLink size={18} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Linked Products</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {products.map(product => (
                      <div 
                        key={product.id} 
                        onClick={() => handleProductSelect(product.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.products.includes(product.id) 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="h-10 w-10 rounded-md object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {currentPromo ? 'Update Promotion' : 'Create Promotion'}
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