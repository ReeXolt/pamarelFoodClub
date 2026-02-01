import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/options';

export async function GET(req) {
  try {
    await connectToDatabase();
    
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await User.find({ referredBy: { $exists: true, $ne: null } });
    const updates = [];
    const boards = ['bronze', 'silver', 'gold', 'platinum'];

    let modifiedCount = 0;

    for (const user of users) {
      // Skip if still on bronze (bronze is handled correctly on signup/payment)
      if (user.currentBoard === 'bronze') continue;

      const referrer = await User.findById(user.referredBy);
      if (!referrer || !Array.isArray(referrer.boardProgress)) continue;

      let referrerModified = false;
      const userLevel = boards.indexOf(user.currentBoard);

      // Check all levels up to current level (starting from Silver=1)
      // Level 0 is Bronze, which is usually fine, but we focus on Silver+
      for (let i = 1; i <= userLevel; i++) {
        const boardName = boards[i];
        const referrerBoard = referrer.boardProgress.find(b => b.boardType === boardName);

        if (referrerBoard) {
            const isListed = referrerBoard.directReferrals.some(id => id.toString() === user._id.toString());
            
            if (!isListed) {
                referrerBoard.directReferrals.push(user._id);
                referrerModified = true;
                updates.push(`Added ${user.username} to ${referrer.username}'s ${boardName} board`);
            }
        }
      }

      if (referrerModified) {
        await referrer.save();
        modifiedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. Updated ${modifiedCount} referrers.`,
      details: updates
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
