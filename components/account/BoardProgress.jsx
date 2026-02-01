'use client';
import { useState, useEffect } from 'react';
import { PLANS } from '@/lib/plans';
import ClaimRewardModal from '../ClaimRewardModal';

export default function BoardProgress({ userData, checkBoardProgress }) {
  const [activeTab, setActiveTab] = useState(userData.currentBoard);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);

  const planBoards = PLANS[userData.currentPlan || userData.plan]?.boards || [];
  
  // Debug: Log the user data to see what's happening
  useEffect(() => {
    
    // Log counts for each board
    ['bronze', 'silver', 'gold'].forEach(board => {
      const counts = getCurrentCounts(board);
      const completed = isBoardCompleted(board);
    });
  }, [userData]);

  const handleCheckProgress = async () => {
    setLoading(true);
    setMessage(null);
    
    const result = await checkBoardProgress();
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else if (result.results && Object.values(result.results).some(r => r.completed)) {
      setMessage({ type: 'success', text: 'Board progress updated successfully!' });
      // Refresh the page to show claim button
      window.location.reload();
    } else {
      setMessage({ type: 'info', text: 'No board progress changes detected.' });
    }
    
    setLoading(false);
  };

  const handleClaimReward = async (boardType, rewardOption) => {
    try {
      const response = await fetch('/api/affiliate/claim-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardType: boardType.toLowerCase(),
          rewardOption
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Reward claimed successfully!' });
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      setMessage({ type: 'error', text: 'Failed to claim reward' });
    }
  };

  const openClaimModal = (boardType) => {
    setSelectedBoard(boardType);
    setShowClaimModal(true);
  };

  const getBoardRequirements = (boardName) => {
    const board = planBoards.find(b => b.name.toLowerCase().includes(boardName.toLowerCase()));
    return board ? {
      requirements1: board.requirements1,
      requirements2: board.requirements2 || '',
      earnings: board.earnings
    } : null;
  };

  // Simplified count function - focus on the new array structure
  const getCurrentCounts = (board) => {
    const boardType = board.toLowerCase();
    const boardProgress = getBoardProgress(boardType);
        
    switch (boardType) {
      case 'bronze':
        return {
          current: boardProgress?.directReferrals?.length || 0,
          required: 7
        };
      case 'silver':
        return {
          current1: boardProgress?.directReferrals?.length || 0,
          required1: 7,
          current2: boardProgress?.indirectReferrals?.length || 0,
          required2: 49
        };
      case 'gold':
        return {
          current1: boardProgress?.directReferrals?.length || 0,
          required1: 7,
          current2: boardProgress?.indirectReferrals?.length || 0,
          required2: 49
        };
      default:
        return null;
    }
  };

  const getBoardEarnings = (boardName) => {
    const board = planBoards.find(b => b.name.toLowerCase().includes(boardName.toLowerCase()));
    return board ? board.earnings : [];
  };

  const getBoardProgress = (boardType) => {
    if (Array.isArray(userData.boardProgress)) {
      const progress = userData.boardProgress.find(b => b.boardType === boardType.toLowerCase());
      return progress || {};
    }
    return {};
  };

  const isBoardCompleted = (board) => {
    const boardProgress = getBoardProgress(board);
    const completed = boardProgress.completed || false;
    return completed;
  };

  const isRewardClaimed = (board) => {
    const boardProgress = getBoardProgress(board);
    return boardProgress.rewardsClaimed || false;
  };

  const getCompletionDate = (board) => {
    const boardProgress = getBoardProgress(board);
    return boardProgress?.completionDate;
  };

  const getClaimedOption = (board) => {
    const boardProgress = getBoardProgress(board);
    return boardProgress?.claimedOption;
  };

  const getClaimedAt = (board) => {
    const boardProgress = getBoardProgress(board);
    return boardProgress?.claimedAt;
  };

  const isCurrentBoard = (board) => {
    return userData.currentBoard?.toLowerCase() === board.toLowerCase();
  };

  // Check if board should be completed based on counts
  const shouldBoardBeCompleted = (board) => {
    const counts = getCurrentCounts(board);
    if (!counts) return false;

    switch (board.toLowerCase()) {
      case 'bronze':
        return counts.current >= counts.required;
      case 'silver':
        return counts.current1 >= counts.required1 && counts.current2 >= counts.required2;
      case 'gold':
        return counts.current1 >= counts.required1 && counts.current2 >= counts.required2;
      default:
        return false;
    }
  };

  const renderProgressBar = (board) => {
    const counts = getCurrentCounts(board);
    if (!counts) return null;

    const boardType = board.toLowerCase();
    
    if (boardType === 'bronze') {
      const progressPercent = Math.min(100, (counts.current / counts.required) * 100);
      return (
        <div>
          <p>{getBoardRequirements(board)?.requirements1}</p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div 
              className="bg-yellow-500 h-4 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-sm mt-1">
            {counts.current} of {counts.required} completed
            {shouldBoardBeCompleted(board) && !isBoardCompleted(board) && (
              <span className="text-red-500 ml-2">✓ Ready to complete (run Check Progress)</span>
            )}
          </p>
        </div>
      );
    }
    
    if (boardType === 'silver') {
      const progressPercent1 = Math.min(100, (counts.current1 / counts.required1) * 100);
      const progressPercent2 = Math.min(100, (counts.current2 / counts.required2) * 100);
      return (
        <div>
          <p>{getBoardRequirements(board)?.requirements1}</p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div 
              className="bg-yellow-500 h-4 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent1}%` }}
            ></div>
          </div>
          <p className="text-sm mt-1">
            {counts.current1} of {counts.required1} completed
          </p>
          
          <p className="mt-4">{getBoardRequirements(board)?.requirements2}</p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div 
              className="bg-yellow-500 h-4 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent2}%` }}
            ></div>
          </div>
          <p className="text-sm mt-1">
            {counts.current2} of {counts.required2} completed
            {shouldBoardBeCompleted(board) && !isBoardCompleted(board) && (
              <span className="text-red-500 ml-2">✓ Ready to complete (run Check Progress)</span>
            )}
          </p>
        </div>
      );
    }
    
    if (boardType === 'gold') {
      const progressPercent1 = Math.min(100, (counts.current1 / counts.required1) * 100);
      const progressPercent2 = Math.min(100, (counts.current2 / counts.required2) * 100);
      return (
        <div>
          <p>{getBoardRequirements(board)?.requirements1}</p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div 
              className="bg-yellow-500 h-4 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent1}%` }}
            ></div>
          </div>
          <p className="text-sm mt-1">
            {counts.current1} of {counts.required1} completed
          </p>
          
          <p className="mt-4">7 x 7 (49) people</p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div 
              className="bg-yellow-500 h-4 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent2}%` }}
            ></div>
          </div>
          <p className="text-sm mt-1">
            {counts.current2} of {counts.required2} completed
            {shouldBoardBeCompleted(board) && !isBoardCompleted(board) && (
              <span className="text-red-500 ml-2">✓ Ready to complete (run Check Progress)</span>
            )}
          </p>
        </div>
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Board Progress</h2>
      
      {/* Debug Info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-700">
          <strong>Debug:</strong> Current Board: {userData.currentBoard} | 
          Bronze Referrals: {getCurrentCounts('bronze')?.current || 0}/7
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['Bronze', 'Silver', 'Gold'].map((board) => (
          <button
            key={board}
            onClick={() => setActiveTab(board)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 min-w-24 ${
              activeTab === board
                ? 'bg-yellow-500 text-white shadow-md transform scale-105'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {board}
          </button>
        ))}
      </div>
      
      {/* Board Content */}
      {activeTab && (
        <div className="border-2 border-gray-200 rounded-lg p-6 bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">{activeTab} Board</h3>
            <span className="text-2xl">
              {activeTab === 'Bronze' ? '🥉' : 
               activeTab === 'Silver' ? '🥈' : '🥇'}
            </span>
          </div>
          
          {/* Claim Reward Button */}
          {isBoardCompleted(activeTab) && !isRewardClaimed(activeTab) && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-yellow-800">Congratulations! 🎉</p>
                  <p className="text-yellow-700">You've completed this board! Claim your reward.</p>
                </div>
                <button
                  onClick={() => openClaimModal(activeTab)}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 font-semibold shadow-md"
                >
                  Claim Reward
                </button>
              </div>
            </div>
          )}
          
          {/* Ready to Complete Notice */}
          {shouldBoardBeCompleted(activeTab) && !isBoardCompleted(activeTab) && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-800">Board Requirements Met! 🎯</p>
                  <p className="text-green-700">You have enough referrals! Click "Check Progress" to mark this board as completed.</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Reward Claimed Status */}
          {isBoardCompleted(activeTab) && isRewardClaimed(activeTab) && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">✅ Reward Claimed</p>
              <p>Claimed on: {getClaimedAt(activeTab) ? new Date(getClaimedAt(activeTab)).toLocaleDateString() : 'Unknown date'}</p>
              {getClaimedOption(activeTab) && (
                <p>Selected option: <span className="font-semibold">{getClaimedOption(activeTab)}</span></p>
              )}
            </div>
          )}
          
          {/* Check Progress Button */}
          {isCurrentBoard(activeTab) && !isBoardCompleted(activeTab) && (
            <div className="mb-6">
              <button
                onClick={handleCheckProgress}
                disabled={loading}
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 transition-colors duration-200 font-semibold shadow-md disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking Progress...
                  </span>
                ) : (
                  'Check Progress'
                )}
              </button>
              {message && (
                <p className={`mt-3 p-3 rounded-lg ${
                  message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 
                  message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 
                  'bg-yellow-100 text-yellow-700 border border-yellow-300'
                }`}>
                  {message.text}
                </p>
              )}
            </div>
          )}
          
          {/* Completion Status */}
          {isBoardCompleted(activeTab) ? (
            <div className="mb-6 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">🏆 Board Completed!</p>
              <p>Completed on: {getCompletionDate(activeTab) ? new Date(getCompletionDate(activeTab)).toLocaleDateString() : 'Unknown date'}</p>
            </div>
          ) : (
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-3 text-gray-700">Requirements:</h4>
              {renderProgressBar(activeTab)}
            </div>
          )}
          
          {/* Earnings Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-lg mb-3 text-gray-700">Earnings:</h4>
            <ul className="list-disc pl-5 space-y-2">
              {getBoardRequirements(activeTab)?.earnings.map((item, index) => (
                <li key={index} className="text-gray-600 leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Claim Reward Modal */}
      <ClaimRewardModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        boardType={selectedBoard}
        earnings={selectedBoard ? getBoardEarnings(selectedBoard) : []}
        onClaim={handleClaimReward}
      />
    </div>
  );
}