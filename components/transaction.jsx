"use client";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

// Generate dummy transaction data with MLM members only
const generateTransactions = () => {
  const statuses = ['delivered', 'pending', 'failed', 'refunded'];
  const products = [
    'Organic Coconut Oil',
    'Herbal Tea Set',
    'Vitamin C Serum',
    'Collagen Powder',
    'Detox Kit',
    'Probiotics',
    'Multivitamins',
    'Essential Oil Bundle'
  ];
  const mlmMembers = [
    { name: 'John Smith', level: 3 },
    { name: 'Sarah Johnson', level: 5 },
    { name: 'Michael Brown', level: 2 },
    { name: 'Emily Davis', level: 4 },
    { name: 'David Wilson', level: 1 },
    { name: 'Jessica Taylor', level: 3 },
    { name: 'Robert Miller', level: 4 },
    { name: 'Sophia Anderson', level: 2 }
  ];
  
  const transactions = [];
  
  for (let i = 1; i <= 50; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const customer = mlmMembers[Math.floor(Math.random() * mlmMembers.length)];
    
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = Math.floor(Math.random() * 50000) + 1000;
    const quantity = Math.floor(Math.random() * 5) + 1;
    const date = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    
    transactions.push({
      id: i,
      transactionId: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
      date: date.toISOString(),
      product: randomProduct,
      customer: customer.name,
      mlmLevel: customer.level,
      amount: amount,
      quantity: quantity,
      total: amount * quantity,
      status: randomStatus,
      commission: Math.floor(amount * quantity * 0.1), // 10% commission
    });
  }
  
  return transactions;
};

const transactionsData = generateTransactions();

const Transactions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [expandedRow, setExpandedRow] = useState(null);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency in Naira
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Sort data
  const sortedData = [...transactionsData].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Request sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor = '';
    switch (status) {
      case 'delivered':
        bgColor = 'bg-green-100 text-green-800';
        break;
      case 'pending':
        bgColor = 'bg-yellow-100 text-yellow-800';
        break;
      case 'failed':
        bgColor = 'bg-red-100 text-red-800';
        break;
      case 'refunded':
        bgColor = 'bg-blue-100 text-blue-800';
        break;
      default:
        bgColor = 'bg-gray-100 text-gray-800';
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Level indicator for MLM members
  const LevelIndicator = ({ level }) => {
    return (
      <div className="flex items-center mt-1">
        <span className="text-xs text-gray-500 mr-2">Level:</span>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full mx-0.5 ${i < level ? 'bg-purple-600' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    );
  };

  // Mobile pagination with ellipsis
  const MobilePagination = () => {
    const visiblePages = [];
    
    // Always show first, current, and last pages
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      visiblePages.push(1);
      if (currentPage > 2) {
        visiblePages.push('...');
      }
      if (currentPage > 1 && currentPage < totalPages) {
        visiblePages.push(currentPage);
      }
      if (currentPage < totalPages - 1) {
        visiblePages.push('...');
      }
      visiblePages.push(totalPages);
    }

    return (
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        <button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        {visiblePages.map((item, index) => (
          item === '...' ? (
            <span
              key={`mobile-ellipsis-${index}`}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
            >
              ...
            </span>
          ) : (
            <button
              key={`mobile-page-${item}`}
              onClick={() => paginate(item)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === item
                  ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {item}
            </button>
          )
        ))}
        
        <button
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </nav>
    );
  };

  // Desktop pagination with ellipsis
  const DesktopPagination = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxVisibleBeforeCurrent = Math.floor(maxVisiblePages / 2);
      const maxVisibleAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;
      
      if (currentPage <= maxVisibleBeforeCurrent) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage + maxVisibleAfterCurrent >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxVisibleBeforeCurrent;
        endPage = currentPage + maxVisibleAfterCurrent;
      }
    }

    if (startPage > 1) {
      items.push(1);
      if (startPage > 2) {
        items.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push('...');
      }
      items.push(totalPages);
    }

    return (
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        <button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        {items.map((item, index) => (
          item === '...' ? (
            <span
              key={`desktop-ellipsis-${index}`}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
            >
              ...
            </span>
          ) : (
            <button
              key={`desktop-page-${item}`}
              onClick={() => paginate(item)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === item
                  ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {item}
            </button>
          )
        ))}
        
        <button
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </nav>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">MLM Transactions</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedData.length)} of {sortedData.length} transactions
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('transactionId')}
                >
                  <div className="flex items-center">
                    Transaction ID
                    {sortConfig.key === 'transactionId' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                    ) : <span className="ml-1 w-4 h-4" />}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('date')}
                >
                  <div className="flex items-center">
                    Date & Time
                    {sortConfig.key === 'date' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                    ) : <span className="ml-1 w-4 h-4" />}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('product')}
                >
                  <div className="flex items-center">
                    Product
                    {sortConfig.key === 'product' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                    ) : <span className="ml-1 w-4 h-4" />}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('total')}
                >
                  <div className="flex items-center">
                    Amount
                    {sortConfig.key === 'total' ? (
                      sortConfig.direction === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                    ) : <span className="ml-1 w-4 h-4" />}
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
              {currentItems.map((transaction) => (
                <React.Fragment key={transaction.id}>
                  <tr 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === transaction.id ? null : transaction.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-purple-600">{transaction.transactionId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(transaction.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.product}</div>
                      <div className="text-xs text-gray-500">Qty: {transaction.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="text-purple-600">
                        {expandedRow === transaction.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRow === transaction.id && (
                    <tr className="bg-gray-50">
                      <td colSpan="6" className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Member Details</h4>
                            <p className="mt-1 text-sm font-medium text-gray-900">{transaction.customer}</p>
                            <LevelIndicator level={transaction.mlmLevel} />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction Details</h4>
                            <div className="mt-1 grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-500">Unit Price:</p>
                                <p className="text-sm font-medium">{formatCurrency(transaction.amount)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Quantity:</p>
                                <p className="text-sm font-medium">{transaction.quantity}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Total:</p>
                                <p className="text-sm font-medium">{formatCurrency(transaction.total)}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission</h4>
                            <p className="mt-1 text-sm font-medium text-purple-600">
                              {formatCurrency(transaction.commission)}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">10% of transaction value</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-medium">{Math.min(indexOfLastItem, sortedData.length)}</span> of{' '}
              <span className="font-medium">{sortedData.length}</span> results
            </div>
            
            {/* Mobile pagination */}
            <div className="sm:hidden">
              <MobilePagination />
            </div>
            
            {/* Desktop pagination */}
            <div className="hidden sm:block">
              <DesktopPagination />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;