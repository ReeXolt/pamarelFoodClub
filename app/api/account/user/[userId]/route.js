import User from '@/models/user';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';

export async function GET(req, { params }) {
  try {
    const { userId } = await params;

    await connectToDatabase();

    // Use the NEW array-based population paths
    const user = await User.findById(userId)
      .populate('referredBy', 'username email referralCode')
      .populate('boardProgress.directReferrals', 'username email currentBoard')
      .populate('boardProgress.indirectReferrals', 'username email currentBoard')
      .populate('downlines', 'username email currentBoard referralCode');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Helper function to get board progress by type from array
    const getBoardProgress = (boardType) => {
      if (Array.isArray(user.boardProgress)) { // Changed userData to user
        return user.boardProgress.find(b => b.boardType === boardType.toLowerCase()) || {
          directReferrals: [],
          indirectReferrals: [],
          completed: false,
          rewardsClaimed: false
        };
      }
      return {
        directReferrals: [],
        indirectReferrals: [],
        completed: false,
        rewardsClaimed: false
      };
    };

    const bronzeProgress = getBoardProgress('bronze');
    const silverProgress = getBoardProgress('silver');
    const goldProgress = getBoardProgress('gold');

    // Calculate counts for the new structure
    const counts = {
      Bronze: {
        directReferrals: bronzeProgress.directReferrals?.length || 0
      },
      Silver: {
        level1: silverProgress.directReferrals?.length || 0,
        level2: silverProgress.indirectReferrals?.length || 0,
        total: (silverProgress.directReferrals?.length || 0) + 
               (silverProgress.indirectReferrals?.length || 0)
      },
      Gold: {
        level3: goldProgress.directReferrals?.length || 0,
        level4: goldProgress.indirectReferrals?.length || 0,
        total: (goldProgress.directReferrals?.length || 0) + 
               (goldProgress.indirectReferrals?.length || 0)
      },
    };

    return NextResponse.json({ 
      success: true, 
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode,
        currentBoard: user.currentBoard,
        currentPlan: user.currentPlan || user.plan,
        wallets: user.wallets || {
          food: user.earnings?.foodWallet || 0,
          gadget: user.earnings?.gadgetsWallet || 0,
          cash: user.earnings?.cashWallet || 0
        },
        referredBy: user.referredBy,
        counts,
        boardProgress: user.boardProgress,
        downlines: user.downlines || []
      }
    });

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}