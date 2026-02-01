import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";

import { PLANS } from "../../../../../lib/plans";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";

export async function POST(request) {
  try {
    await connectToDatabase();
    const { boardType } = await request.json();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find the board progress
    const boardProgress = user.boardProgress.find(b => b.boardType === boardType);
    if (!boardProgress || !boardProgress.completed || boardProgress.rewardsClaimed) {
      return NextResponse.json(
        { error: "Board not completed or reward already claimed" },
        { status: 400 }
      );
    }

    // Get rewards from PLANS configuration
    const plan = PLANS[user.currentPlan];
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan configuration" },
        { status: 500 }
      );
    }

    const boardConfig = plan.boards.find(b => 
      b.name.toLowerCase().includes(boardType)
    );

    if (!boardConfig) {
      return NextResponse.json(
        { error: "Board configuration not found" },
        { status: 500 }
      );
    }

    // Process rewards
    boardConfig.earnings.forEach(earning => {
      const amount = extractAmount(earning) || 0;

      if (earning.includes('Food Wallet') || earning.includes('FOODY BAG')) {
        user.wallets.food += amount;
      } 
      else if (earning.includes('Gadgets Wallet')) {
        user.wallets.gadget += amount;
      }
      else if (earning.includes('Cash Wallet')) {
        user.wallets.cash += amount;
      }
    });

    // Mark reward as claimed
    boardProgress.rewardsClaimed = true;

    // If not the last board, move to next board
    const boardsOrder = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = boardsOrder.indexOf(boardType);
    
    if (currentIndex < boardsOrder.length - 1) {
      const nextBoard = boardsOrder[currentIndex + 1];
      user.currentBoard = nextBoard;
      
      // Initialize next board if not exists
      if (!user.boardProgress.some(b => b.boardType === nextBoard)) {
        user.boardProgress.push({
          boardType: nextBoard,
          directReferrals: [],
          indirectReferrals: [],
          completed: false,
          rewardsClaimed: false
        });
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Rewards claimed successfully",
      wallets: user.wallets
    });

  } catch (error) {
    console.error("Error claiming reward:", error);
    return NextResponse.json(
      { error: "Failed to claim reward" },
      { status: 500 }
    );
  }
}

function extractAmount(text) {
  const match = text.match(/₦([\d,]+)/);
  return match ? parseInt(match[1].replace(/,/g, '')) : 0;
}