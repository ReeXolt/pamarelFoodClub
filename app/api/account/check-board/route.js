import connectToDatabase from '@/lib/dbConnect';
import BoardCompletion from '@/models/BoardCompletion';
import { NextResponse } from 'next/server';
import { PLANS } from '@/lib/plans';
import User from '@/models/user';

export async function POST(req) {
  try {
    const { userId } = await req.json();
    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const results = {};
    
    // Check current board for completion using new array structure
    if (user.currentBoard && !user.currentBoard.completed) {
      const currentBoardType = user.currentBoard.toLowerCase();
      results[currentBoardType] = await checkBoardCompletion(userId, currentBoardType);
    }

    return NextResponse.json({ success: true, results });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function checkBoardCompletion(userId, boardType) {
  const user = await User.findById(userId).populate('referredBy');
  const plan = PLANS[user.currentPlan || user.plan];
  const boardData = plan.boards.find(b => b.name.toLowerCase().includes(boardType));

  let isCompleted = false;
  let updateData = {};
  let earnings = {};

  // Get the board progress from the array
  const boardProgress = user.boardProgress?.find(b => b.boardType === boardType) || {};

  switch (boardType) {
    case 'bronze':
      const bronzeDirectReferrals = boardProgress.directReferrals?.length || 0;
      if (bronzeDirectReferrals >= 7) {
        isCompleted = true;
        
        // Update the specific board in the array
        updateData = {
          $set: {
            'boardProgress.$[bronzeElem].completed': true,
            'boardProgress.$[bronzeElem].completionDate': new Date(),
            currentBoard: 'silver'
          }
        };

        earnings = extractEarnings(boardData.earnings);

        if (user.referredBy) {
          await updateUplineReferences(user.referredBy._id, userId, 'silver', 1);
        }
      }
      break;

    case 'silver':
      const silverDirectReferrals = boardProgress.directReferrals?.length || 0;
      const silverIndirectReferrals = boardProgress.indirectReferrals?.length || 0;
      
      if (silverDirectReferrals >= 7 && silverIndirectReferrals >= 49) {
        isCompleted = true;
        
        updateData = {
          $set: {
            'boardProgress.$[silverElem].completed': true,
            'boardProgress.$[silverElem].completionDate': new Date(),
            currentBoard: 'gold'
          }
        };

        earnings = extractEarnings(boardData.earnings);

        if (user.referredBy) {
          await updateUplineReferences(user.referredBy._id, userId, 'gold', 3);
        }
      }
      break;

    case 'gold':
      const goldDirectReferrals = boardProgress.directReferrals?.length || 0;
      const goldIndirectReferrals = boardProgress.indirectReferrals?.length || 0;
      
      if (goldDirectReferrals >= 7 && goldIndirectReferrals >= 49) {
        isCompleted = true;
        
        updateData = {
          $set: {
            'boardProgress.$[goldElem].completed': true,
            'boardProgress.$[goldElem].completionDate': new Date(),
            currentBoard: 'completed'
          }
        };

        earnings = extractEarnings(boardData.earnings);

        if (user.referredBy) {
          await updateUplineReferences(user.referredBy._id, userId, 'completed', 5);
        }
      }
      break;
  }

  if (isCompleted) {
    // Prepare array filters for updating the specific board in the array
    const arrayFilters = [];
    if (boardType === 'bronze') {
      arrayFilters.push({ 'bronzeElem.boardType': 'bronze' });
    } else if (boardType === 'silver') {
      arrayFilters.push({ 'silverElem.boardType': 'silver' });
    } else if (boardType === 'gold') {
      arrayFilters.push({ 'goldElem.boardType': 'gold' });
    }

    // Update user with completion status ONLY - NO wallet crediting here
    await User.findByIdAndUpdate(userId, updateData, { arrayFilters });

    // Note: BoardCompletion record is now created in claim-reward route
    // Note: Wallets are now credited in claim-reward route
  }

  return { completed: isCompleted, board: boardType, earnings };
}

async function updateUplineReferences(uplineId, userId, targetBoard, currentLevel) {
  const upline = await User.findById(uplineId);
  if (!upline || currentLevel > 6) return;

  let boardTypeToUpdate = '';
  let referralType = ''; // 'direct' or 'indirect'
  let shouldCheckCompletion = false;

  switch (upline.currentBoard) {
    case 'silver':
      if (targetBoard === 'silver') {
        boardTypeToUpdate = 'silver';
        referralType = currentLevel === 1 ? 'direct' : 'indirect';
      }
      break;

    case 'gold':
      if (targetBoard === 'silver' && currentLevel >= 3) {
        boardTypeToUpdate = 'gold';
        referralType = currentLevel === 3 ? 'direct' : 'indirect';
      }
      break;
  }

  if (boardTypeToUpdate && referralType) {
    // Update the specific board in the upline's array
    const uplineBoard = upline.boardProgress?.find(b => b.boardType === boardTypeToUpdate);
    if (uplineBoard) {
      const updateField = `boardProgress.$[boardElem].${referralType === 'direct' ? 'directReferrals' : 'indirectReferrals'}`;
      
      await User.findByIdAndUpdate(uplineId, {
        $addToSet: { [updateField]: userId }
      }, {
        arrayFilters: [{ 'boardElem.boardType': boardTypeToUpdate }]
      });
      
      shouldCheckCompletion = true;
    }
  }

  // Recursively update further upline
  if (upline.referredBy) {
    await updateUplineReferences(
      upline.referredBy._id,
      userId,
      targetBoard,
      currentLevel + 1
    );
  }

  // Check if upline's board is now completed
  if (shouldCheckCompletion) {
    await checkBoardCompletion(uplineId, upline.currentBoard);
  }
}

function extractEarnings(earningsArray) {
  const earnings = {};
  
  earningsArray.forEach(item => {
    if (item.includes('Food Wallet') || item.includes('FOODY BAG') || item.toLowerCase().includes('food')) {
      const amount = item.match(/₦([\d,]+)/);
      if (amount) earnings.food = parseInt(amount[1].replace(/,/g, ''));
    } 
    else if (item.includes('Gadgets Wallet') || item.toLowerCase().includes('gadget')) {
      const amount = item.match(/₦([\d,]+)/);
      if (amount) earnings.gadget = parseInt(amount[1].replace(/,/g, ''));
    } 
    else if (item.includes('Cash Wallet') || item.includes('CASH') || item.toLowerCase().includes('cash')) {
      const amount = item.match(/₦([\d,]+)/);
      if (amount) earnings.cash = parseInt(amount[1].replace(/,/g, ''));
    }
  });

  return earnings;
}