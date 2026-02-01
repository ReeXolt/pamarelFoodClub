"use client";
import { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

const statusMap = {
  'pending': { icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'successful': { icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-200' },
  'failed': { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200' },
  'cancelled': { icon: XCircle, color: 'bg-gray-100 text-gray-800 border-gray-200' }
};

const planTypeMap = {
  'basic': { label: 'Basic Plan', icon: DollarSign, color: 'bg-blue-100 text-blue-800' },
  'classic': { label: 'Classic Plan', icon: DollarSign, color: 'bg-purple-100 text-purple-800' },
  'deluxe': { label: 'Deluxe Plan', icon: DollarSign, color: 'bg-yellow-100 text-yellow-800' },
  'wallet_funding': { label: 'Wallet Funding', icon: Wallet, color: 'bg-green-100 text-green-800' },
  'wallet_withdraw': { label: 'Wallet Withdrawal', icon: ArrowUpRight, color: 'bg-orange-100 text-orange-800' },
  'flutterwave_withdraw': { label: 'Flutterwave Withdrawal', icon: ArrowUpRight, color: 'bg-red-100 text-red-800' }
};

const paymentMethodMap = {
  'card': { icon: CreditCard, label: 'Card' },
  'bank_transfer': { icon: DollarSign, label: 'Bank Transfer' },
  'mobile_money': { icon: Wallet, label: 'Mobile Money' },
  'ussd': { icon: DollarSign, label: 'USSD' },
  'account': { icon: Wallet, label: 'Account' }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    // Use a consistent format that works on both server and client
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch (error) {
    return 'N/A';
  }
};

const TransactionStatusBadge = ({ status }) => {
  const StatusIcon = statusMap[status]?.icon || Clock;
  const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
      <StatusIcon className="mr-1 h-3 w-3" />
      {status || 'pending'}
    </span>
  );
};

const PlanTypeBadge = ({ planType }) => {
  const planInfo = planTypeMap[planType] || { label: planType, icon: DollarSign, color: 'bg-gray-100 text-gray-800' };
  const PlanIcon = planInfo.icon;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planInfo.color}`}>
      <PlanIcon className="mr-1 h-3 w-3" />
      {planInfo.label}
    </span>
  );
};

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [planTypeFilter, setPlanTypeFilter] = useState(searchParams.get('planType') || 'all');
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '20');
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (planTypeFilter !== 'all') params.set('planType', planTypeFilter);

      const response = await fetch(`/api/admin/transactions?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
        setTotalPages(data.pages);
        setTotal(data.total);
      } else {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, statusFilter, planTypeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== searchParams.get('search')) {
        setCurrentPage(1);
        fetchTransactions();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaymentMethodIcon = (method) => {
    const methodInfo = paymentMethodMap[method] || { icon: DollarSign, label: method || 'N/A' };
    const MethodIcon = methodInfo.icon;
    return (
      <div className="flex items-center">
        <MethodIcon className="h-4 w-4 mr-1 text-gray-500" />
        <span className="text-sm text-gray-700 capitalize">{methodInfo.label}</span>
      </div>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-600 mt-1">View and manage all transactions including payments and wallet activities</p>
        </div>
        <button className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
          <Download className="mr-2 h-4 w-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by transaction ID, reference, email, or name..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="successful">Successful</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              value={planTypeFilter}
              onChange={(e) => {
                setPlanTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Types</option>
              <option value="basic">Basic Plan</option>
              <option value="classic">Classic Plan</option>
              <option value="deluxe">Deluxe Plan</option>
              <option value="wallet_funding">Wallet Funding</option>
              <option value="wallet_withdraw">Wallet Withdrawal</option>
              <option value="flutterwave_withdraw">Flutterwave Withdrawal</option>
            </select>
          </div>
        </form>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Total Transactions</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{total.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Successful</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {transactions.filter(t => t.status === 'successful').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {transactions.filter(t => t.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Failed</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {transactions.filter(t => t.status === 'failed').length}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchTransactions}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
          <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <>
                  <tr 
                    key={transaction._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === transaction._id ? null : transaction._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.transactionId}</div>
                      <div className="text-xs text-gray-500">{transaction.flutterwaveTxRef}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.user?.name || transaction.user?.username || transaction.user?.email || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">{transaction.user?.email || transaction.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PlanTypeBadge planType={transaction.planType} />
                      {transaction.planName && (
                        <div className="text-xs text-gray-500 mt-1">{transaction.planName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-gray-500">{transaction.currency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TransactionStatusBadge status={transaction.status} />
                      {transaction.paymentStatus && transaction.paymentStatus !== transaction.status && (
                        <div className="text-xs text-gray-500 mt-1">
                          Payment: {transaction.paymentStatus}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {expandedRow === transaction._id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </td>
                  </tr>
                  {expandedRow === transaction._id && (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Transaction Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex gap-4">
                                <span className="text-gray-500">Transaction ID:</span>
                                <span className="font-medium">{transaction.transactionId}</span>
                              </div>
                              <div className="flex gap-4">
                                <span className="text-gray-500">Flutterwave Ref:</span>
                                <span className="font-medium">{transaction.flutterwaveTxRef}</span>
                              </div>
                              {transaction.flutterwaveId && (
                                <div className="flex gap-4">
                                  <span className="text-gray-500">Flutterwave ID:</span>
                                  <span className="font-medium">{transaction.flutterwaveId}</span>
                                </div>
                              )}
                              <div className="flex gap-4">
                                <span className="text-gray-500">Created:</span>
                                <span className="font-medium">{formatDate(transaction.createdAt)}</span>
                              </div>
                              {transaction.paidAt && (
                                <div className="flex gap-4">
                                  <span className="text-gray-500">Paid At:</span>
                                  <span className="font-medium">{formatDate(transaction.paidAt)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">User Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex gap-10">
                                <span className="text-gray-500">Name:</span>
                                <span className="font-medium">{transaction.user?.username || transaction.userName}</span>
                              </div>
                              <div className="flex gap-10">
                                <span className="text-gray-500">Email:</span>
                                <span className="font-medium">{transaction.user?.email || transaction.userEmail}</span>
                              </div>
                              {(transaction.user?.phone || transaction.userPhone) && (
                                <div className="flex gap-10">
                                  <span className="text-gray-500">Phone:</span>
                                  <span className="font-medium">{transaction.user?.phone || transaction.userPhone}</span>
                                </div>
                              )}
                              {transaction.user?.referralCode && (
                                <div className="flex gap-10">
                                  <span className="text-gray-500">Referral Code:</span>
                                  <span className="font-medium">{transaction.user.referralCode}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {transaction.meta && Object.keys(transaction.meta).length > 0 && (
                            <div className="md:col-span-2">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Additional Information</h4>
                              <div className="bg-white p-3 rounded border border-gray-200">
                                <pre className="text-xs text-gray-600 overflow-x-auto">
                                  {JSON.stringify(transaction.meta, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, total)} of {total} transactions
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-gray-700 hover:bg-gray-100 bg-white border border-gray-300'}`}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'text-gray-700 hover:bg-gray-100 bg-white border border-gray-300'}`}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

