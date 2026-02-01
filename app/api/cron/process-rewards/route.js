import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";
import RecurringReward from "@/models/RecurringReward";

export const dynamic = 'force-dynamic'; // Prevent caching for cron jobs

export async function GET(request) {
  try {
    // SECURITY: In production, verify a secret token header
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    await connectToDatabase();

    const now = new Date();
    
    // Find active rewards that are due
    // status: 'active', nextDueDate <= now
    const dueRewards = await RecurringReward.find({
      status: 'active',
      nextDueDate: { $lte: now }
    }).populate('user');

    const results = {
      processed: 0,
      completed: 0,
      errors: 0,
      details: []
    };

    for (const reward of dueRewards) {
      try {
        const user = reward.user;
        
        if (!user) {
          // User deleted? Mark as cancelled
          reward.status = 'cancelled';
          await reward.save();
          continue;
        }

        // Credit Wallet
        if (!user.wallets) {
             // Handle legacy earnings structure if needed, or init wallets
             user.wallets = user.earnings || { food: 0, gadget: 0, cash: 0 };
             // Map legacy if strictly necessary but ideally user schema is consistent by now
             if (user.earnings?.foodWallet) user.wallets.food = user.earnings.foodWallet;
             if (user.earnings?.gadgetsWallet) user.wallets.gadget = user.earnings.gadgetsWallet;
             if (user.earnings?.cashWallet) user.wallets.cash = user.earnings.cashWallet;
        }

        const amount = reward.monthlyAmount;

        if (reward.walletType === 'food') {
          user.wallets.food = (user.wallets.food || 0) + amount;
          // Sync legacy if it exists
          if (user.earnings) user.earnings.foodWallet = (user.earnings.foodWallet || 0) + amount;
        } else if (reward.walletType === 'gadget') {
          user.wallets.gadget = (user.wallets.gadget || 0) + amount;
           if (user.earnings) user.earnings.gadgetsWallet = (user.earnings.gadgetsWallet || 0) + amount;
        } else if (reward.walletType === 'cash') {
          user.wallets.cash = (user.wallets.cash || 0) + amount;
           if (user.earnings) user.earnings.cashWallet = (user.earnings.cashWallet || 0) + amount;
        }

        user.markModified('wallets');
        if (user.earnings) user.markModified('earnings');
        await user.save();

        // Update Reward Record
        reward.monthsPaid += 1;
        reward.history.push({
          paidAt: new Date(),
          amount: amount,
          monthNumber: reward.monthsPaid
        });

        // Check if completed
        if (reward.monthsPaid >= reward.totalMonths) {
          reward.status = 'completed';
          results.completed++;
        } else {
          // Schedule next due date (30 days from PREVIOUS due date to avoid drift, or from now?)
          // Using from now ensures we don't double pay if cron was down for a month, but drift might happen.
          // Better: nextDueDate + 30 days.
          const nextDate = new Date(reward.nextDueDate);
          nextDate.setDate(nextDate.getDate() + 30);
          reward.nextDueDate = nextDate;
        }

        await reward.save();
        
        results.processed++;
        results.details.push({
          id: reward._id,
          user: user.username,
          amount: amount,
          status: reward.status
        });

      } catch (err) {
        console.error(`Error processing reward ${reward._id}:`, err);
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Recurring rewards processed",
      stats: results
    });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
