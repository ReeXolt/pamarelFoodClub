"use client";
import { useState, useEffect } from 'react';
import { 
  FiChevronLeft, 
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiDownload,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiCreditCard
} from 'react-icons/fi';

const ITEMS_PER_PAGE = 6;

// Generate dummy payment data
const generateDummyPayments = (type, count) => {
  const statuses = ['completed', 'pending', 'failed'];
  const methods = ['card', 'bank transfer', 'wallet'];
  
  return Array.from({ length: count }, (_, i) => {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomMethod = methods[Math.floor(Math.random() * methods.length)];
    const amount = Math.floor(Math.random() * 50000) + 1000;
    const date = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    
    return {
      id: `${type.substring(0, 3)}_${i + 1}`,
      reference: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      amount: amount,
      fee: type === 'payouts' ? Math.floor(amount * 0.015) : Math.floor(amount * 0.02),
      netAmount: type === 'payouts' ? amount - Math.floor(amount * 0.015) : amount,
      status: randomStatus,
      method: randomMethod,
      date: date.toISOString(),
      recipient: `User ${Math.floor(Math.random() * 100) + 1}`,
      type: type
    };
  });
};

export default function PaymentsDashboard() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  // Load dummy data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const data = {
        transactions: generateDummyPayments('transactions', 25),
        withdrawals: generateDummyPayments('withdrawals', 18),
        payouts: generateDummyPayments('payouts', 15)
      };
      setPayments(data);
      setFilteredPayments(data[activeTab]);
      setLoading(false);
    }, 800);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  // Apply filters
  useEffect(() => {
    if (!payments[activeTab]) return;
    
    let result = [...payments[activeTab]];
    
    if (searchQuery) {
      result = result.filter(payment => 
        payment.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.recipient.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(payment => payment.status === statusFilter);
    }
    
    setFilteredPayments(result);
    setCurrentPage(1);
  }, [payments, activeTab, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = filteredPayments.slice(
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

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: <FiCheckCircle className="text-green-500" /> };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: <FiClock className="text-yellow-500" /> };
      case 'failed':
        return { color: 'bg-red-100 text-red-800', icon: <FiXCircle className="text-red-500" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <FiClock className="text-gray-500" /> };
    }
  };

  // Get method icon
  const getMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return <FiCreditCard className="text-blue-500" />;
      case 'bank transfer':
        return <FiDollarSign className="text-green-500" />;
      case 'wallet':
        return <FiUser className="text-purple-500" />;
      default:
        return <FiDollarSign className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Payments Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage and track all payment activities</p>
          </div>
          <button className="mt-4 md:mt-0 flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <FiDownload className="mr-2" />
            Export Report
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-3 font-medium text-sm md:text-base ${activeTab === 'transactions' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-3 font-medium text-sm md:text-base ${activeTab === 'withdrawals' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Withdrawals
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-3 font-medium text-sm md:text-base ${activeTab === 'payouts' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Payouts
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
                placeholder={`Search ${activeTab} by reference or recipient...`}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="text-gray-400" />
                </div>
                <select
                  className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payments List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <>
            {filteredPayments.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
                <h3 className="text-lg font-medium text-gray-900">No {activeTab} found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                {!isMobile && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto mb-8">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          {activeTab !== 'transactions' && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                          )}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedPayments.map((payment) => {
                          const statusInfo = getStatusInfo(payment.status);
                          return (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {payment.reference}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.recipient}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                ₦{payment.amount.toLocaleString()}
                              </td>
                              {activeTab !== 'transactions' && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ₦{payment.fee.toLocaleString()}
                                </td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                ₦{payment.netAmount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  {getMethodIcon(payment.method)}
                                  <span className="ml-2 capitalize">{payment.method}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(payment.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {statusInfo.icon}
                                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
                                    {payment.status}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Mobile Cards View */}
                {isMobile && (
                  <div className="grid grid-cols-1 gap-4 mb-8">
                    {paginatedPayments.map((payment) => {
                      const statusInfo = getStatusInfo(payment.status);
                      return (
                        <div key={payment.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{payment.reference}</p>
                              <p className="text-sm text-gray-500">{payment.recipient}</p>
                            </div>
                            <div className="flex items-center">
                              {statusInfo.icon}
                              <span className={`ml-1 px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
                                {payment.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <p className="text-xs text-gray-400">Amount</p>
                              <p className="text-sm font-medium">₦{payment.amount.toLocaleString()}</p>
                            </div>
                            {activeTab !== 'transactions' && (
                              <div>
                                <p className="text-xs text-gray-400">Fee</p>
                                <p className="text-sm text-gray-500">₦{payment.fee.toLocaleString()}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-gray-400">Net Amount</p>
                              <p className="text-sm font-medium">₦{payment.netAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Method</p>
                              <div className="flex items-center">
                                {getMethodIcon(payment.method)}
                                <span className="ml-1 text-sm capitalize">{payment.method}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {formatDate(payment.date)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {filteredPayments.length > ITEMS_PER_PAGE && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-500">
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPayments.length)} of {filteredPayments.length} {activeTab}
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
    </div>
  );
}