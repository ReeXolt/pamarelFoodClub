import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";
import BoardCompletion from "@/models/BoardCompletion";
import RecurringReward from "@/models/RecurringReward";
import { plans } from "@/lib/plans";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    await connectToDatabase();
    const { boardType, rewardOption } = await request.json();
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

    // Convert boardType to proper case for object lookup
    const boardTypeProper = boardType.charAt(0).toUpperCase() + boardType.slice(1).toLowerCase();

    // Handle both array and object structures for boardProgress
    let boardProgress;

    // Check if it's the legacy object structure
    const isLegacyStructure =
      user.boardProgress &&
      !Array.isArray(user.boardProgress) &&
      (typeof user.boardProgress === 'object' || user.boardProgress instanceof Map);

    if (isLegacyStructure) {
      // Safe migration logic
      const legacyData = user.boardProgress.toObject ? user.boardProgress.toObject() : user.boardProgress;
      const validBoards = ['bronze', 'silver', 'gold', 'platinum'];
      const newBoardProgress = [];

      Object.keys(legacyData).forEach(key => {
        // Skip internal mongoose keys
        if (key.startsWith('$') || key === '_id' || key === 'id') return;

        const normalizedType = key.toLowerCase();
        if (validBoards.includes(normalizedType)) {
          const board = legacyData[key];
          newBoardProgress.push({
            boardType: normalizedType,
            directReferrals: board.directReferrals || board.level1Referrals || board.level3Referrals || [],
            indirectReferrals: board.indirectReferrals || board.level2Referrals || board.level4Referrals || [],
            completed: board.completed || false,
            rewardsClaimed: board.rewardsClaimed || false,
            completionDate: board.completionDate,
            claimedOption: board.claimedOption,
            claimedAt: board.claimedAt
          });
        }
      });

      // Update user with new array structure
      user.boardProgress = newBoardProgress;
      user.markModified('boardProgress');

      // Find the specific board we are claiming for
      boardProgress = user.boardProgress.find(b => b.boardType === boardType.toLowerCase());

      // Save immediately to persist the migration structure
      if (newBoardProgress.length > 0) {
        await user.save();
      }
    } else if (Array.isArray(user.boardProgress)) {
      // Already array structure
      boardProgress = user.boardProgress.find(b => b.boardType === boardType.toLowerCase());
    }

    if (!boardProgress || !boardProgress.completed || boardProgress.rewardsClaimed) {
      return NextResponse.json(
        { error: "Board not completed or reward already claimed" },
        { status: 400 }
      );
    }

    // Get rewards from plans configuration
    const plan = plans.find(
      (plan) => plan.id === (user.currentPlan || user.plan)
    );
    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan configuration" },
        { status: 500 }
      );
    }

    const boardConfig = plan.boards.find(b =>
      b.name.toLowerCase().includes(boardType.toLowerCase())
    );

    if (!boardConfig) {
      return NextResponse.json(
        { error: "Board configuration not found" },
        { status: 500 }
      );
    }

    // Initialize wallets if they don't exist
    if (!user.earnings) {
      user.earnings = {
        food: user.earnings?.foodWallet || 0,
        gadget: user.earnings?.gadgetsWallet || 0,
        cash: user.earnings?.cashWallet || 0
      };
    }

    // Process rewards based on user selection
    let processedRewards = [];
    let completionEarnings = {};

    // Import RecurringReward dynamically if needed or assume top-level import
    const RecurringReward = mongoose.models.RecurringReward || mongoose.model('RecurringReward');

    for (const earning of boardConfig.earnings) {
      const amount = extractAmount(earning) || 0;

      // STRICT VALIDATION: Only credit logical wallet items
      // 1. Handle OR options
      if (earning.includes('OR') && rewardOption) {
        const options = earning.split('OR').map(opt => opt.trim());
        const selectedOption = options.find(opt =>
          opt.toLowerCase().includes(rewardOption.toLowerCase())
        );

        if (selectedOption) {
          const selectedAmount = extractAmount(selectedOption) || 0;

          // ALWAYS set the claimed option to the full string found in the plan
          boardProgress.claimedOption = selectedOption;

          // ONLY credit if it's explicitly a wallet/cash item
          if (selectedOption.toLowerCase().includes('cash')) {
            user.earnings.cashWallet += selectedAmount;
            processedRewards.push({ type: 'cash', amount: selectedAmount, description: selectedOption });
            completionEarnings.cash = selectedOption; // Store full string
          } else if (selectedOption.toLowerCase().includes('food wallet')) { // Strict check for 'Wallet'
            user.earnings.foodWallet += selectedAmount;
            processedRewards.push({ type: 'food', amount: selectedAmount, description: selectedOption });
            completionEarnings.food = selectedOption; // Store full string
          } else if (selectedOption.toLowerCase().includes('gadget wallet') || selectedOption.toLowerCase().includes('gadgets wallet')) { // Strict check for 'Wallet'
            user.earnings.gadgetsWallet += selectedAmount;
            processedRewards.push({ type: 'gadget', amount: selectedAmount, description: selectedOption });
            completionEarnings.gadget = selectedOption; // Store full string
          } else {
            // Physical item (e.g., Foody Bag) - Record but DO NOT credit wallet
            processedRewards.push({ type: 'item', amount: 0, description: selectedOption });
            completionEarnings.item = selectedOption; // Store full string
          }
        }
        continue; // Done with this OR group
      }

      // 2. Handle standard rewards (no OR)

      // Skip "Total:" lines as they are just summaries
      if (earning.trim().startsWith('Total:')) {
        continue;
      }

      const isWalletItem =
        earning.includes('Food Wallet') ||
        earning.includes('Gadget') || // Covers "Gadget Wallet", "Gadget:", "Gadgets Wallet"
        earning.includes('Cash Wallet') ||
        earning.includes('CASH') ||
        earning.includes('Cashback');

      if (isWalletItem) {
        // CHECK FOR RECURRING PATTERN: "₦X monthly ... for Y months"
        // Example: "Food Wallet: ₦2,000,000 (₦200,000 monthly food supplies for 10 months)"
        const recurringMatch = earning.match(/\(₦([\d,]+)\s+monthly.*?for\s+(\d+)\s+months/i);

        if (recurringMatch) {
          const monthlyAmount = parseInt(recurringMatch[1].replace(/,/g, ''));
          const durationMonths = parseInt(recurringMatch[2]);

          // Credit ONLY the first month
          let walletType = 'food'; // Default for typical recurring food supplies
          if (earning.includes('Gadget')) walletType = 'gadget';
          if (earning.includes('Cash')) walletType = 'cash';

          if (walletType === 'food') user.earnings.foodWallet += monthlyAmount;
          else if (walletType === 'gadget') user.earnings.gadgetsWallet += monthlyAmount;
          else if (walletType === 'cash') user.earnings.cashWallet += monthlyAmount;

          // Save Recurring Reward Subscription
          const nextDueDate = new Date();
          nextDueDate.setDate(nextDueDate.getDate() + 30); // 30 days from now

          await new RecurringReward({
            user: user._id,
            boardType: boardEnum || 'Unknown',
            description: earning,
            walletType: walletType,
            monthlyAmount: monthlyAmount,
            totalMonths: durationMonths,
            monthsPaid: 1,
            nextDueDate: nextDueDate,
            status: 'active',
            history: [{
              paidAt: new Date(),
              amount: monthlyAmount,
              monthNumber: 1
            }]
          }).save();

          processedRewards.push({
            type: `${walletType}_recurring_initial`,
            amount: monthlyAmount,
            description: `${earning} (Initial ${monthlyAmount} credited, recurring set for ${durationMonths} months)`
          });

          // Store full string in completion record, but annotated
          if (walletType === 'food') completionEarnings.food = (completionEarnings.food || []).concat(earning + " [RECURRING STARTED]");
          else if (walletType === 'gadget') completionEarnings.gadget = (completionEarnings.gadget || []).concat(earning + " [RECURRING STARTED]");
          else completionEarnings.cash = (completionEarnings.cash || []).concat(earning + " [RECURRING STARTED]");

        } else {
          // STANDARD FULL AMOUNT CREDIT
          if (earning.includes('Food Wallet')) {
            user.earnings.foodWallet += amount;
            processedRewards.push({ type: 'food', amount, description: earning });
            completionEarnings.food = (completionEarnings.food || []).concat(earning);
          } else if (earning.includes('Gadget Wallet') || earning.includes('Gadgets Wallet') || earning.includes('Gadget:')) {
            user.earnings.gadgetsWallet += amount;
            processedRewards.push({ type: 'gadget', amount, description: earning });
            completionEarnings.gadget = (completionEarnings.gadget || []).concat(earning);
          } else if (earning.includes('Cash Wallet') || earning.includes('CASH') || earning.includes('Cashback')) {
            user.earnings.cashWallet += amount;
            processedRewards.push({ type: 'cash', amount, description: earning });
            completionEarnings.cash = (completionEarnings.cash || []).concat(earning);
          } else {
            processedRewards.push({ type: 'item', amount: 0, description: earning });
            completionEarnings.other = (completionEarnings.other || []).concat(earning);
          }
        }
      } else {
        // It's a physical item (e.g. "Welcome FOODY BAG", "Car Award")
        processedRewards.push({ type: 'item', amount: 0, description: earning });
        completionEarnings.other = (completionEarnings.other || []).concat(earning);
      }
    }

    // Mark reward as claimed
    boardProgress.rewardsClaimed = true;
    // Note: claimedOption is set inside the loop for OR options. 
    // If no OR option was processed (e.g. standard claim), we can set it to "All Rewards Claimed" or leave null if not needed.
    // Ideally, for non-OR boards, we might not need a specific 'claimedOption' string unless desired.
    if (!boardProgress.claimedOption && rewardOption) {
      boardProgress.claimedOption = "Standard Reward Bundle";
    }
    boardProgress.claimedAt = new Date();

    // RECORD BOARD COMPLETION (Moved from check-board)
    // BoardCompletion imported at top
    // const BoardCompletion = mongoose.models.BoardCompletion || mongoose.model('BoardCompletion');

    // Ensure board name is Title Case for Enum validation ('Bronze', 'Silver', 'Gold')
    const boardEnum = boardType.charAt(0).toUpperCase() + boardType.slice(1).toLowerCase();

    if (['Bronze', 'Silver', 'Gold'].includes(boardEnum)) {
      await new BoardCompletion({
        user: user._id,
        board: boardEnum,
        earnings: completionEarnings
      }).save();
    }


    // If not the last board, move to next board
    const boardsOrder = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = boardsOrder.indexOf(boardType.toLowerCase());
    let nextBoard = null;
    if (currentIndex < boardsOrder.length - 1) {
      nextBoard = boardsOrder[currentIndex + 1];
      user.currentBoard = nextBoard;

      // Initialize next board if not exists (for array structure)
      if (Array.isArray(user.boardProgress) && !user.boardProgress.some(b => b.boardType === nextBoard)) {
        user.boardProgress.push({
          boardType: nextBoard,
          directReferrals: [],
          indirectReferrals: [],
          completed: false,
          rewardsClaimed: false
        });
      }
    }

    // UPDATE REFERRER: Add user to referrer's next board
    if (user.referredBy) {
      try {
        const referrer = await User.findById(user.referredBy);
        // Only update if referrer exists and has modern array structure
        if (referrer && Array.isArray(referrer.boardProgress)) {
          let referrerNextBoard = referrer.boardProgress.find(b => b.boardType === nextBoard);

          if (!referrerNextBoard) {
            // Initialize next board for referrer if it doesn't exist (ensures "record though" works)
            referrerNextBoard = {
              boardType: nextBoard,
              directReferrals: [],
              indirectReferrals: [],
              completed: false,
              rewardsClaimed: false
            };
            referrer.boardProgress.push(referrerNextBoard);
            // Re-fetch the reference from the array to be safe, though pushing object usually keeps ref
            // But modifying the pushed object works in Mongoose
          }

          if (referrerNextBoard) {
            // Check if not already added to avoid duplicates
            // Use loose comparison or toString for ObjectIds
            const isAlreadyReferral = referrerNextBoard.directReferrals.some(ref => ref.toString() === user._id.toString());

            if (!isAlreadyReferral) {
              referrerNextBoard.directReferrals.push(user._id);
              referrer.markModified('boardProgress'); // Essential for array updates in mixed/nested schemas
              await referrer.save();
            }
          }
        }
      } catch (err) {
        console.error("Failed to update referrer progress:", err);
        // Continue execution, don't fail the claim for this
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Rewards claimed successfully",
      wallets: user.earnings,
      processedRewards,
      nextBoard: user.currentBoard
    });

  } catch (error) {
    console.error("Error claiming reward:", error);
    return NextResponse.json(
      { error: "Failed to claim reward: " + error.message },
      { status: 500 }
    );
  }
}

function extractAmount(text) {
  if (!text) return 0;
  const match = text.match(/₦([\d,]+)/);
  return match ? parseInt(match[1].replace(/,/g, '')) : 0;
}