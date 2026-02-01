// app/api/admin/force-migrate/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const users = await User.find({});
    let migratedCount = 0;
    let errors = [];

    for (const user of users) {
      try {
        let updateData = {};
        let needsUpdate = false;

        // Fix currentBoard - ensure lowercase
        if (user.currentBoard && user.currentBoard !== user.currentBoard.toLowerCase()) {
          updateData.currentBoard = user.currentBoard.toLowerCase();
          needsUpdate = true;
        }

        // Migrate plan to currentPlan
        if (user.plan && !user.currentPlan) {
          updateData.currentPlan = user.plan;
          needsUpdate = true;
        }

        // Migrate earnings to wallets
        if (user.earnings && (!user.wallets || Object.keys(user.wallets).length === 0)) {
          updateData.wallets = {
            food: user.earnings.foodWallet || 0,
            gadget: user.earnings.gadgetsWallet || 0,
            cash: user.earnings.cashWallet || 0
          };
          needsUpdate = true;
        }

        // Convert boardProgress from object to array
        if (user.boardProgress && !Array.isArray(user.boardProgress)) {
          const boardProgressArray = [];
          
          // Convert each board
          ['Bronze', 'Silver', 'Gold'].forEach(boardName => {
            if (user.boardProgress[boardName]) {
              const oldBoard = user.boardProgress[boardName];
              const newBoard = {
                boardType: boardName.toLowerCase(),
                directReferrals: oldBoard.directReferrals || oldBoard.level1Referrals || oldBoard.level3Referrals || [],
                indirectReferrals: oldBoard.indirectReferrals || oldBoard.level2Referrals || oldBoard.level4Referrals || [],
                completed: oldBoard.completed || false,
                rewardsClaimed: oldBoard.rewardsClaimed || false
              };
              
              // Add dates if they exist
              if (oldBoard.completionDate) newBoard.completionDate = oldBoard.completionDate;
              if (oldBoard.claimedAt) newBoard.claimedAt = oldBoard.claimedAt;
              if (oldBoard.claimedOption) newBoard.claimedOption = oldBoard.claimedOption;
              
              boardProgressArray.push(newBoard);
            }
          });
          
          updateData.boardProgress = boardProgressArray;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await User.findByIdAndUpdate(user._id, { $set: updateData });
          migratedCount++;
        }
      } catch (userError) {
        errors.push({
          userId: user._id,
          username: user.username,
          error: userError.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Force migration completed`,
      stats: {
        totalUsers: users.length,
        migratedCount,
        errorCount: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error("Force migration error:", error);
    return NextResponse.json(
      { error: "Force migration failed: " + error.message },
      { status: 500 }
    );
  }
}