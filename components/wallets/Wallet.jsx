"use client";
import { useState } from "react";
import { Wallet, DollarSign, Smartphone, Utensils } from "lucide-react";
import { FundWalletModal } from "./FundWalletModal";
import { WithdrawWalletModal } from "./WithdrawWalletModal";

export default function WalletDisplay({ wallets }) {
    const [activeModal, setActiveModal] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleFundClick = (walletType) => {
        setActiveModal(`fund-${walletType}`);
        setSuccessMessage('');
    };

    const handleWithdrawClick = (walletType) => {
        setActiveModal(`withdraw-${walletType}`);
        setSuccessMessage('');
    };

    const handleSuccess = (data) => {
        const action = data.action === 'withdraw' ? 'withdrawn from' : 'funded';
        setSuccessMessage(`Successfully ${action} ${data.walletType} wallet with ₦${data.amount}`);
        setActiveModal(null);
    };

    const walletData = [
        {
            type: 'cash',
            name: 'Cash Wallet',
            icon: <DollarSign className="w-5 h-5" />,
            color: 'bg-green-100 text-green-800',
            border: 'border-green-200',
            button: 'bg-green-600 hover:bg-green-700',
            showActions: true // Flag to show buttons for this wallet
        },
        {
            type: 'gadget',
            name: 'Gadget Wallet',
            icon: <Smartphone className="w-5 h-5" />,
            color: 'bg-blue-100 text-blue-800',
            border: 'border-blue-200',
            button: 'bg-blue-600 hover:bg-blue-700',
            showActions: false
        },
        {
            type: 'food',
            name: 'Food Wallet',
            icon: <Utensils className="w-5 h-5" />,
            color: 'bg-orange-100 text-orange-800',
            border: 'border-orange-200',
            button: 'bg-orange-600 hover:bg-orange-700',
            showActions: false
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center px-4">
                <Wallet className="w-6 h-6 text-yellow-500 mr-2" />
                <h2 className="text-xl font-semibold">My Wallets</h2>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mx-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {successMessage}
                </div>
            )}

            {/* Wallet Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
                {walletData.map((wallet) => (
                    <div 
                        key={wallet.type}
                        className={`border rounded-lg p-5 ${wallet.color} ${wallet.border}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                                <div className={`p-2 rounded-full ${wallet.color} mr-3`}>
                                    {wallet.icon}
                                </div>
                                <h3 className="font-medium">{wallet.name}</h3>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-2xl font-bold">
                                ₦{wallets?.[wallet.type]?.toLocaleString() || '0.00'}
                            </p>
                            <p className="text-sm opacity-75">Current Balance</p>
                        </div>
                        
                        {wallet.showActions && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleFundClick(wallet.type)}
                                    className={`w-full text-white py-2 px-4 rounded-md transition-colors ${wallet.button}`}
                                >
                                    Fund
                                </button>
                                <button
                                    onClick={() => handleWithdrawClick(wallet.type)}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors"
                                >
                                    Withdraw
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Fund Wallet Modals */}
            {walletData.map((wallet) => (
                activeModal === `fund-${wallet.type}` && (
                    <FundWalletModal 
                        key={`fund-modal-${wallet.type}`}
                        walletType={wallet.type} 
                        walletName={wallet.name}
                        onClose={() => setActiveModal(null)} 
                        onSuccess={handleSuccess}
                    />
                )
            ))}

            {/* Withdraw Wallet Modals */}
            {walletData.map((wallet) => (
                activeModal === `withdraw-${wallet.type}` && (
                    <WithdrawWalletModal 
                        key={`withdraw-modal-${wallet.type}`}
                        walletType={wallet.type} 
                        walletName={wallet.name}
                        balance={wallets?.[wallet.type] || 0}
                        onClose={() => setActiveModal(null)} 
                        onSuccess={handleSuccess}
                    />
                )
            ))}
        </div>
    );
}