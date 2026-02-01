"use client";
import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiUser, FiMail, FiPhone, FiDollarSign, FiAward, FiUsers, FiTrendingUp, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const CustomerTable = () => {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    plan: 'all',
    board: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userRewards, setUserRewards] = useState([]);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [editForm, setEditForm] = useState({
    plan: '',
    currentBoard: '',
    status: '',
    role: ''
  });
  const [networkProgress, setNetworkProgress] = useState({});

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch affiliates data
  const fetchAffiliates = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.plan !== 'all' && { plan: filters.plan }),
        ...(filters.board !== 'all' && { board: filters.board }),
      }).toString();

      const res = await fetch(`/api/admin/affiliates?${queryParams}`);
      const data = await res.json();

      if (res.ok) {
        setAffiliates(data.users || []);
        setTotalPages(data.totalPages || 1);
        
        // Pre-fetch network data for all affiliates
        if (data.users && data.users.length > 0) {
          data.users.forEach(affiliate => {
            fetchNetworkProgress(affiliate._id);
          });
        }
      } else {
        toast.error(data.error || 'Failed to fetch affiliates');
      }
    } catch (error) {
      toast.error('Network error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch network progress for a specific affiliate
  const fetchNetworkProgress = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/network`);
      const data = await res.json();
      
      if (res.ok) {
        setNetworkProgress(prev => ({
          ...prev,
          [userId]: data
        }));
      }
    } catch (error) {
      // Use fallback data if network API fails
      setNetworkProgress(prev => ({
        ...prev,
        [userId]: getFallbackProgressData(userId)
      }));
    }
  };

  // Fallback progress data with correct requirements
  const getFallbackProgressData = (userId) => {
    const affiliate = affiliates.find(a => a._id === userId);
    if (!affiliate) return {};
    
    const boardProgress = affiliate.boardProgress || [];
    const bronzeProgress = boardProgress.find(bp => bp.boardType === 'bronze') || {};
    
    return {
      bronze: {
        directReferrals: Array.isArray(bronzeProgress.directReferrals) ? bronzeProgress.directReferrals.length : 0,
        completed: bronzeProgress.completed || false,
        totalRequired: 7
      },
      silver: {
        level1Referrals: 0,
        level2Referrals: 0,
        completed: false,
        level1Required: 7,
        level2Required: 49
      },
      gold: {
        level3Referrals: 0,
        level4Referrals: 0,
        completed: false,
        level3Required: 343,
        level4Required: 2401
      },
      platinum: {
        completed: false,
        totalRequired: 7
      }
    };
  };

  // Safe progress data getter
  const getProgressData = (affiliate) => {
    if (!affiliate) return {};
    return networkProgress[affiliate._id] || getFallbackProgressData(affiliate._id);
  };

  useEffect(() => {
    fetchAffiliates();
  }, [currentPage, debouncedSearchTerm, filters]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort affiliates
  const sortedAffiliates = [...affiliates].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    if (sortConfig.key === 'username') {
      if (a.username < b.username) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a.username > b.username) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    }
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // View affiliate details
  const viewAffiliateDetails = async (affiliate) => {
    setSelectedAffiliate(affiliate);
    
    // Ensure we have the latest network data
    if (!networkProgress[affiliate._id]) {
      await fetchNetworkProgress(affiliate._id);
    }
    
    setShowDetailModal(true);

    // Fetch detailed rewards history
    setLoadingRewards(true);
    setUserRewards([]);
    try {
      const res = await fetch(`/api/admin/users/${affiliate._id}/rewards`);
      const data = await res.json();
      if (data.success) {
        setUserRewards(data.rewards);
      } else {
        setUserRewards([]);
      }
    } catch (error) {
      console.error("Error fetching rewards:", error);
      setUserRewards([]);
    } finally {
      setLoadingRewards(false);
    }
  };

  // Open edit modal
  const openEditModal = (affiliate) => {
    setSelectedAffiliate(affiliate);
    setEditForm({
      plan: affiliate.plan || affiliate.currentPlan || '',
      currentBoard: affiliate.currentBoard || '',
      status: affiliate.status || '',
      role: affiliate.role || ''
    });
    setShowEditModal(true);
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Update user
  const updateUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${selectedAffiliate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('User updated successfully');
        setShowEditModal(false);
        fetchAffiliates(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to update user');
      }
    } catch (error) {
      toast.error('Network error');
      console.error(error);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('User deleted successfully');
        fetchAffiliates(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Network error');
      console.error(error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    if (!status) return null;
    
    let bgColor = '';
    switch (status) {
      case 'active':
        bgColor = 'bg-green-100 text-green-800';
        break;
      case 'suspended':
        bgColor = 'bg-red-100 text-red-800';
        break;
      case 'pending':
        bgColor = 'bg-yellow-100 text-yellow-800';
        break;
      default:
        bgColor = 'bg-gray-100 text-gray-800';
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Plan badge component
  const PlanBadge = ({ plan }) => {
    if (!plan) return null;
    
    let bgColor = '';
    switch (plan) {
      case 'basic':
        bgColor = 'bg-yellow-100 text-yellow-800';
        break;
      case 'classic':
        bgColor = 'bg-purple-100 text-purple-800';
        break;
      case 'deluxe':
        bgColor = 'bg-indigo-100 text-indigo-800';
        break;
      default:
        bgColor = 'bg-gray-100 text-gray-800';
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  // Board badge component
  const BoardBadge = ({ board }) => {
    if (!board) return null;
    
    const boardLower = board.toLowerCase();
    let bgColor = '';
    switch (boardLower) {
      case 'bronze':
        bgColor = 'bg-amber-100 text-amber-800';
        break;
      case 'silver':
        bgColor = 'bg-gray-100 text-gray-800';
        break;
      case 'gold':
        bgColor = 'bg-yellow-100 text-yellow-800';
        break;
      case 'platinum':
        bgColor = 'bg-blue-100 text-blue-800';
        break;
      case 'completed':
        bgColor = 'bg-green-100 text-green-800';
        break;
      default:
        bgColor = 'bg-gray-100 text-gray-800';
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {board.charAt(0).toUpperCase() + board.slice(1)}
      </span>
    );
  };

  // Progress bar component
  const ProgressBar = ({ current, total, label }) => {
    const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{label}</span>
          <span>{current}/{total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-yellow-600 h-2 rounded-full" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Get wallet balance - handles both old and new structures
  const getWalletBalance = (affiliate, walletType) => {
    if (!affiliate) return 0;
    
    // Try new structure first
    if (affiliate.wallets && affiliate.wallets[walletType] !== undefined) {
      return affiliate.wallets[walletType] || 0;
    }
    
    // Fallback to old structure
    if (affiliate.earnings) {
      switch (walletType) {
        case 'food': return affiliate.earnings.foodWallet || 0;
        case 'gadget': return affiliate.earnings.gadgetsWallet || 0;
        case 'cash': return affiliate.earnings.cashWallet || 0;
        default: return 0;
      }
    }
    
    return 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Customers Management</h1>
      
      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by username, email, or referral code..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiFilter />
            Filters
            {showFilters ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={filters.plan}
                onChange={(e) => handleFilterChange('plan', e.target.value)}
              >
                <option value="all">All Plans</option>
                <option value="basic">Basic</option>
                <option value="classic">Classic</option>
                <option value="deluxe">Deluxe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
              <select
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={filters.board}
                onChange={(e) => handleFilterChange('board', e.target.value)}
              >
                <option value="all">All Boards</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Customers</div>
          <div className="text-2xl font-bold">{affiliates.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {affiliates.filter(a => a.status === 'active').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Gold Level</div>
          <div className="text-2xl font-bold text-yellow-600">
            {affiliates.filter(a => a.currentBoard?.toLowerCase() === 'gold').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Earnings</div>
          <div className="text-2xl font-bold text-green-600">
            ₦{affiliates.reduce((total, a) => total + getWalletBalance(a, 'cash'), 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Affiliates Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('username')}
                    >
                      <div className="flex items-center gap-1">
                        Customer
                        {sortConfig.key === 'username' && (
                          sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Board
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('createdAt')}
                    >
                      <div className="flex items-center gap-1">
                        Joined
                        {sortConfig.key === 'createdAt' && (
                          sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAffiliates.length > 0 ? (
                    sortedAffiliates.map((affiliate) => {
                      const progress = getProgressData(affiliate);
                      
                      return (
                        <tr key={affiliate._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <FiUser className="text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {affiliate.username || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Ref: {affiliate.referralCode || 'N/A'}
                                </div>
                                {affiliate.role === 'admin' && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    Admin
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center gap-1">
                              <FiMail />
                              {affiliate.email || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <FiPhone />
                              {affiliate.phone || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <PlanBadge plan={affiliate.plan || affiliate.currentPlan} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <BoardBadge board={affiliate.currentBoard} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1 text-sm">
                                <FiUser className="text-yellow-500" />
                                <span className="font-medium">
                                  {progress.bronze?.directReferrals || 0}
                                </span>/7 Direct
                              </div>
                              
                              {/* Silver Board Requirements */}
                              {(affiliate.currentBoard === 'silver' || affiliate.currentBoard === 'gold' || affiliate.currentBoard === 'platinum') && (
                                <>
                                  <div className="flex items-center gap-1 text-sm">
                                    <FiUsers className="text-purple-500" />
                                    <span className="font-medium">
                                      {progress.silver?.level1Referrals || 0}
                                    </span>/7 Level 1
                                  </div>
                                  <div className="flex items-center gap-1 text-sm">
                                    <FiTrendingUp className="text-green-500" />
                                    <span className="font-medium">
                                      {progress.silver?.level2Referrals || 0}
                                    </span>/49 Level 2
                                  </div>
                                </>
                              )}
                              
                              {/* Gold Board Requirements */}
                              {(affiliate.currentBoard === 'gold' || affiliate.currentBoard === 'platinum') && (
                                <>
                                  <div className="flex items-center gap-1 text-sm">
                                    <FiAward className="text-blue-500" />
                                    <span className="font-medium">
                                      {progress.gold?.level3Referrals || 0}
                                    </span>/343 Level 3
                                  </div>
                                  <div className="flex items-center gap-1 text-sm">
                                    <FiDollarSign className="text-red-500" />
                                    <span className="font-medium">
                                      {progress.gold?.level4Referrals || 0}
                                    </span>/2401 Level 4
                                  </div>
                                </>
                              )}
                              
                              {/* Platinum Board Requirements */}
                              {affiliate.currentBoard === 'platinum' && (
                                <div className="flex items-center gap-1 text-sm">
                                  <FiAward className="text-purple-500" />
                                  <span className="font-medium">
                                    {progress.platinum?.completed ? 'Completed' : 'In Progress'}
                                  </span> Platinum
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={affiliate.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(affiliate.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => viewAffiliateDetails(affiliate)}
                                className="text-yellow-600 hover:text-yellow-900 flex items-center gap-1"
                              >
                                <FiEye /> View
                              </button>
                              <button
                                onClick={() => openEditModal(affiliate)}
                                className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                              >
                                <FiEdit /> Edit
                              </button>
                              <button
                                onClick={() => deleteUser(affiliate._id)}
                                className="text-red-600 hover:text-red-900 flex items-center gap-1"
                              >
                                <FiTrash2 /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                        No customers found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, affiliates.length)}
                    </span>{' '}
                    of <span className="font-medium">{affiliates.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-yellow-50 border-yellow-500 text-yellow-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Affiliate Detail Modal */}
      {showDetailModal && selectedAffiliate && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-semibold">Customer Details</h2>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Username:</span> {selectedAffiliate.username || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {selectedAffiliate.email || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {selectedAffiliate.phone || 'N/A'}</p>
                    <p><span className="font-medium">Referral Code:</span> {selectedAffiliate.referralCode || 'N/A'}</p>
                    <p><span className="font-medium">Plan:</span> <PlanBadge plan={selectedAffiliate.plan || selectedAffiliate.currentPlan} /></p>
                    <p><span className="font-medium">Status:</span> <StatusBadge status={selectedAffiliate.status} /></p>
                    <p><span className="font-medium">Current Board:</span> <BoardBadge board={selectedAffiliate.currentBoard} /></p>
                    <p><span className="font-medium">Role:</span> {selectedAffiliate.role || 'user'}</p>
                    <p><span className="font-medium">Joined:</span> {formatDate(selectedAffiliate.createdAt)}</p>
                    {selectedAffiliate.referredBy && (
                      <p>
                        <span className="font-medium">Referred By:</span> {selectedAffiliate.referredBy.username} 
                        ({selectedAffiliate.referredBy.referralCode})
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Board Progress</h3>
                  <div className="space-y-4">
                    {/* Bronze Board */}
                    {getProgressData(selectedAffiliate).bronze && (
                      <div>
                        <h4 className="font-medium mb-2">Bronze Board</h4>
                        <ProgressBar 
                          current={getProgressData(selectedAffiliate).bronze.directReferrals} 
                          total={getProgressData(selectedAffiliate).bronze.totalRequired} 
                          label="Direct Referrals (7 required)" 
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Status: {getProgressData(selectedAffiliate).bronze.completed ? 'Completed' : 'In Progress'}
                        </p>
                      </div>
                    )}
                    
                    {/* Silver Board */}
                    {getProgressData(selectedAffiliate).silver && (
                      <div>
                        <h4 className="font-medium mb-2">Silver Board</h4>
                        <ProgressBar 
                          current={getProgressData(selectedAffiliate).silver.level1Referrals} 
                          total={getProgressData(selectedAffiliate).silver.level1Required} 
                          label="Level 1 Referrals (7 required)" 
                        />
                        <ProgressBar 
                          current={getProgressData(selectedAffiliate).silver.level2Referrals} 
                          total={getProgressData(selectedAffiliate).silver.level2Required} 
                          label="Level 2 Referrals (49 required)" 
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Status: {getProgressData(selectedAffiliate).silver.completed ? 'Completed' : 'In Progress'}
                        </p>
                      </div>
                    )}
                    
                    {/* Gold Board */}
                    {getProgressData(selectedAffiliate).gold && (
                      <div>
                        <h4 className="font-medium mb-2">Gold Board</h4>
                        <ProgressBar 
                          current={getProgressData(selectedAffiliate).gold.level1Referrals} 
                          total={getProgressData(selectedAffiliate).gold.level1Required} 
                          label="Level 1 Referrals (343 required)" 
                        />
                        <ProgressBar 
                          current={getProgressData(selectedAffiliate).gold.level2Referrals} 
                          total={getProgressData(selectedAffiliate).gold.level2Required} 
                          label="Level 2 Referrals (2401 required)" 
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Status: {getProgressData(selectedAffiliate).gold.completed ? 'Completed' : 'In Progress'}
                        </p>
                      </div>
                    )}
                    
                    {/* Platinum Board */}
                    {/* {getProgressData(selectedAffiliate).platinum && (
                      <div>
                        <h4 className="font-medium mb-2">Platinum Board</h4>
                        <p className="text-sm text-gray-600">
                          Requires 7 direct referrals on Platinum board
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Status: {getProgressData(selectedAffiliate).platinum.completed ? 'Completed' : 'In Progress'}
                        </p>
                      </div>
                    )} */}
                  </div>
                </div>
              
              {/* Claimed Rewards Section */}
              <div className="mt-6 border-t pt-4">
                 <h3 className="text-lg font-medium text-gray-900 mb-2">Claimed Rewards History</h3>
                 
                 {loadingRewards ? (
                   <p className="text-sm text-gray-500">Loading rewards...</p>
                 ) : (
                   <div className="space-y-3">
                      {userRewards.length > 0 ? (
                        userRewards.map((reward, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-100">
                             <div className="flex justify-between items-center mb-2">
                               <span className="font-semibold text-yellow-700 capitalize">{reward.board} Board</span>
                               <span className="text-xs text-gray-500">
                                 {new Date(reward.completionDate).toLocaleDateString()}
                               </span>
                             </div>
                             
                             <div className="text-sm space-y-1">
                               {reward.earnings.cash && (
                                 <div className="flex gap-2">
                                    <span className="font-medium min-w-[60px]">Cash:</span>
                                    <span className="text-gray-700">
                                      {Array.isArray(reward.earnings.cash) 
                                        ? reward.earnings.cash.join(', ') 
                                        : reward.earnings.cash}
                                    </span>
                                 </div>
                               )}
                               
                               {reward.earnings.food && (
                                 <div className="flex gap-2">
                                    <span className="font-medium min-w-[60px]">Food:</span>
                                    <span className="text-gray-700">
                                      {Array.isArray(reward.earnings.food) 
                                        ? reward.earnings.food.join(', ') 
                                        : reward.earnings.food}
                                    </span>
                                 </div>
                               )}
                               
                               {reward.earnings.gadget && (
                                 <div className="flex gap-2">
                                    <span className="font-medium min-w-[60px]">Gadget:</span>
                                    <span className="text-gray-700">
                                      {Array.isArray(reward.earnings.gadget) 
                                        ? reward.earnings.gadget.join(', ') 
                                        : reward.earnings.gadget}
                                    </span>
                                 </div>
                               )}
                               
                               {reward.earnings.other && (
                                  <div className="mt-1 pt-1 border-t border-gray-200">
                                    <span className="font-medium block mb-1">Items/Other:</span>
                                    <ul className="list-disc pl-5 text-gray-600">
                                      {Array.isArray(reward.earnings.other) ? (
                                        reward.earnings.other.map((item, i) => (
                                          <li key={i}>{item}</li>
                                        ))
                                      ) : (
                                        <li>{reward.earnings.other}</li>
                                      )}
                                    </ul>
                                  </div>
                               )}
                             </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">No detailed reward history found.</p>
                      )}
                   </div>
                 )}
              </div>
              
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Earnings & Wallets</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Food Wallet</p>
                    <p className="text-xl">₦{getWalletBalance(selectedAffiliate, 'food').toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Gadgets Wallet</p>
                    <p className="text-xl">₦{getWalletBalance(selectedAffiliate, 'gadget').toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">Cash Wallet</p>
                    <p className="text-xl">₦{getWalletBalance(selectedAffiliate, 'cash').toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedAffiliate && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-semibold">Edit User</h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <select
                    name="plan"
                    value={editForm.plan}
                    onChange={handleEditChange}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Plan</option>
                    <option value="basic">Basic</option>
                    <option value="classic">Classic</option>
                    <option value="deluxe">Deluxe</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Board</label>
                  <select
                    name="currentBoard"
                    value={editForm.currentBoard}
                    onChange={handleEditChange}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Board</option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={updateUser}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;