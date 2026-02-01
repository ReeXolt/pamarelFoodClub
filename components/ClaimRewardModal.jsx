'use client';
import { useState, useEffect } from 'react';

export default function ClaimRewardModal({ 
  isOpen, 
  onClose, 
  boardType, 
  earnings, 
  onClaim 
}) {
  const [selectedOption, setSelectedOption] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);

  // Check if earnings have multiple options (contains "OR")
  const hasMultipleOptions = earnings.some(earning => earning.includes('OR'));

  // Parse options from earnings
  const getRewardOptions = () => {
    const options = [];
    
    earnings.forEach(earning => {
      if (earning.includes('OR')) {
        const splitOptions = earning.split('OR').map(opt => opt.trim());
        splitOptions.forEach(option => {
          const isCash = option.toLowerCase().includes('cash');
          const isFood = option.toLowerCase().includes('food') || option.toLowerCase().includes('foody bag');
          const isGadget = option.toLowerCase().includes('gadget');
          
          options.push({
            value: isCash ? 'cash' : isFood ? 'food' : isGadget ? 'gadget' : 'other',
            label: option,
            amount: extractAmount(option),
            type: isCash ? 'cash' : isFood ? 'food' : isGadget ? 'gadget' : 'other'
          });
        });
      } else {
        // Single option rewards
        if (earning.includes('Food Wallet') || earning.includes('FOODY BAG') || earning.toLowerCase().includes('food')) {
          options.push({
            value: 'food',
            label: earning,
            amount: extractAmount(earning),
            type: 'food'
          });
        } else if (earning.includes('Gadgets Wallet') || earning.toLowerCase().includes('gadget')) {
          options.push({
            value: 'gadget', 
            label: earning,
            amount: extractAmount(earning),
            type: 'gadget'
          });
        } else if (earning.includes('Cash Wallet') || earning.includes('CASH') || earning.toLowerCase().includes('cashback')) {
          options.push({
            value: 'cash',
            label: earning,
            amount: extractAmount(earning),
            type: 'cash'
          });
        } else {
          options.push({
            value: 'auto',
            label: earning,
            amount: extractAmount(earning),
            type: 'auto'
          });
        }
      }
    });

    return options;
  };

  const extractAmount = (text) => {
    const match = text.match(/₦([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  };

  const handleClaim = async () => {
    if (hasMultipleOptions && !selectedOption) {
      alert('Please select a reward option');
      return;
    }

    setIsClaiming(true);
    try {
      await onClaim(boardType, selectedOption);
      onClose();
    } catch (error) {
      console.error('Error claiming reward:', error);
      alert('Failed to claim reward. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  const rewardOptions = getRewardOptions();

  // Reset selected option when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedOption('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Claim {boardType} Board Reward</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-semibold"
          >
            ×
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3 text-gray-700">Available Rewards:</h3>
          <ul className="list-disc pl-5 mb-4 space-y-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            {earnings.map((earning, index) => (
              <li key={index} className="text-gray-600 leading-relaxed">
                {earning}
              </li>
            ))}
          </ul>
        </div>

        {hasMultipleOptions && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">Choose your reward:</h3>
            <div className="space-y-3">
              {rewardOptions.map((option, index) => (
                <label 
                  key={index} 
                  className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedOption === option.value 
                      ? 'border-yellow-500 bg-yellow-50' 
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="rewardOption"
                    value={option.value}
                    checked={selectedOption === option.value}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="mt-1 text-yellow-500 focus:ring-yellow-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{option.label}</span>
                    {option.amount > 0 && (
                      <p className="text-sm text-green-600 font-semibold mt-1">
                        Amount: ₦{option.amount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {!hasMultipleOptions && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-semibold text-center">
              ✅ All rewards will be automatically distributed to your wallets.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isClaiming}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleClaim}
            disabled={isClaiming || (hasMultipleOptions && !selectedOption)}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-md"
          >
            {isClaiming ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Claiming...
              </span>
            ) : (
              'Claim Reward'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}