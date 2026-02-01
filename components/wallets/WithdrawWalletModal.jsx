"use client";
import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader } from "lucide-react";

export function WithdrawWalletModal({ walletType, walletName, balance, onClose, onSuccess }) {
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [banks, setBanks] = useState([]);
    const [loadingBanks, setLoadingBanks] = useState(true);
    const [selectedBank, setSelectedBank] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");
    const [verifyingAccount, setVerifyingAccount] = useState(false);
    const [savedAccounts, setSavedAccounts] = useState([]);
    const [useSavedAccount, setUseSavedAccount] = useState(false);
    const [selectedSavedAccount, setSelectedSavedAccount] = useState("");

    // Load banks from Flutterwave API
    useEffect(() => {
        const loadBanks = async () => {
            try {
                setLoadingBanks(true);
                const response = await fetch('/api/wallets/banks');
                const data = await response.json();
                
                if (data.success) {
                    setBanks(data.data);
                } else {
                    setError('Failed to load banks');
                }
            } catch (error) {
                console.error('Error loading banks:', error);
                setError('Failed to load banks');
            } finally {
                setLoadingBanks(false);
            }
        };

        loadBanks();
    }, []);

    // Load saved bank accounts
    useEffect(() => {
        const loadSavedAccounts = async () => {
            try {
                const response = await fetch('/api/wallets/bank-accounts');
                const data = await response.json();
                if (data.success) {
                    setSavedAccounts(data.accounts || []);
                }
            } catch (error) {
                console.error('Error loading saved accounts:', error);
            }
        };

        loadSavedAccounts();
    }, []);

    // Verify account number when bank and account number are provided
    useEffect(() => {
        const verifyAccount = async () => {
            if (selectedBank && accountNumber.length === 10) {
                setVerifyingAccount(true);
                try {
                    const response = await fetch('/api/wallets/verify-account', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            accountNumber,
                            bankCode: selectedBank
                        })
                    });

                    const data = await response.json();
                    if (data.success) {
                        setAccountName(data.data.account_name);
                    } else {
                        setAccountName("");
                        setError(data.error || 'Invalid account number');
                    }
                } catch (error) {
                    console.error('Error verifying account:', error);
                    setAccountName("");
                    setError('Failed to verify account number');
                } finally {
                    setVerifyingAccount(false);
                }
            }
        };

        const timeoutId = setTimeout(verifyAccount, 1000);
        return () => clearTimeout(timeoutId);
    }, [accountNumber, selectedBank]);

    // Handle saved account selection
    useEffect(() => {
        if (useSavedAccount && selectedSavedAccount) {
            const account = savedAccounts.find(acc => acc._id === selectedSavedAccount);
            if (account) {
                setSelectedBank(account.bankCode);
                setAccountNumber(account.accountNumber);
                setAccountName(account.accountName);
            }
        }
    }, [useSavedAccount, selectedSavedAccount, savedAccounts]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!amount || isNaN(amount)) {
            setError("Please enter a valid amount");
            return;
        }

        const numericAmount = parseFloat(amount);
        if (numericAmount <= 0) {
            setError("Amount must be greater than 0");
            return;
        }

        if (numericAmount > balance) {
            setError("Insufficient balance");
            return;
        }

        if (!selectedBank || !accountNumber || !accountName) {
            setError("Please provide valid bank details");
            return;
        }

        setIsSubmitting(true);
        
        try {
            const response = await fetch('/api/wallets/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletType,
                    amount: numericAmount,
                    bankCode: selectedBank,
                    accountNumber,
                    accountName,
                    saveAccount: !useSavedAccount // Save if it's a new account
                })
            });

            const data = await response.json();

            if (data.success) {
                onSuccess({
                    walletType,
                    amount: numericAmount.toFixed(2),
                    action: 'withdraw',
                    reference: data.reference
                });
            } else {
                setError(data.error || 'Withdrawal failed');
            }
        } catch (error) {
            console.error('Withdrawal error:', error);
            setError('Withdrawal failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddNewAccount = () => {
        setUseSavedAccount(false);
        setSelectedSavedAccount("");
        setSelectedBank("");
        setAccountNumber("");
        setAccountName("");
    };

    return (
        <div className="fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white">
                    <h3 className="text-lg font-semibold">Withdraw from {walletName}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4">
                    <form onSubmit={handleSubmit}>
                        {/* Amount Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount (₦)
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                placeholder="Enter amount to withdraw"
                                step="0.01"
                                min="0"
                                max={balance}
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                Available balance: <span className="font-semibold">₦{balance.toLocaleString()}</span>
                            </p>
                        </div>

                        {/* Saved Accounts */}
                        {savedAccounts.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Use Saved Account
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddNewAccount}
                                        className="text-sm text-yellow-600 hover:text-yellow-700 flex items-center"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add New
                                    </button>
                                </div>
                                
                                {useSavedAccount ? (
                                    <select
                                        value={selectedSavedAccount}
                                        onChange={(e) => setSelectedSavedAccount(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                    >
                                        <option value="">Select saved account</option>
                                        {savedAccounts.map((account) => (
                                            <option key={account._id} value={account._id}>
                                                {account.accountName} - {account.accountNumber} ({account.bankName})
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="space-y-2">
                                        {savedAccounts.map((account) => (
                                            <div key={account._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{account.accountName}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {account.accountNumber} • {account.bankName}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUseSavedAccount(true);
                                                        setSelectedSavedAccount(account._id);
                                                    }}
                                                    className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                                                >
                                                    Use
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bank Details - Show when not using saved account */}
                        {!useSavedAccount && (
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Bank
                                    </label>
                                    {loadingBanks ? (
                                        <div className="flex items-center justify-center p-4">
                                            <Loader className="w-5 h-5 animate-spin text-yellow-600" />
                                            <span className="ml-2 text-gray-600">Loading banks...</span>
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedBank}
                                            onChange={(e) => setSelectedBank(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                            required
                                        >
                                            <option value="">Select your bank</option>
                                            {banks.map((bank) => (
                                                <option key={bank.code} value={bank.code}>
                                                    {bank.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Number
                                    </label>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                        placeholder="Enter 10-digit account number"
                                        maxLength={10}
                                        required
                                    />
                                </div>

                                {accountName && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm text-green-800">
                                            <span className="font-semibold">Account Name:</span> {accountName}
                                        </p>
                                    </div>
                                )}

                                {verifyingAccount && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Loader className="w-4 h-4 animate-spin mr-2" />
                                        Verifying account number...
                                    </div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors font-medium flex items-center"
                                disabled={isSubmitting || verifyingAccount}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    'Withdraw'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}