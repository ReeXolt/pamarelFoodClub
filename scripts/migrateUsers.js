// scripts/migrateUsers.js
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';

export async function migrateUsers() {
  try {
    await connectToDatabase();
    
    const users = await User.find({});
    let migratedCount = 0;

    for (const user of users) {
      let needsUpdate = false;

      // Migrate plan to currentPlan
      if (user.plan && !user.currentPlan) {
        user.currentPlan = user.plan;
        needsUpdate = true;
      }

      // Migrate earnings to wallets
      if (user.earnings && (!user.wallets || Object.keys(user.wallets).length === 0)) {
        user.wallets = {
          food: user.earnings.foodWallet || 0,
          gadget: user.earnings.gadgetsWallet || 0,
          cash: user.earnings.cashWallet || 0
        };
        needsUpdate = true;
      }

      // Migrate boardProgress from object to array
      if (user.boardProgress && !Array.isArray(user.boardProgress)) {
        const boardProgressArray = [];
        
        // Convert Bronze board
        if (user.boardProgress.Bronze) {
          boardProgressArray.push({
            boardType: 'bronze',
            directReferrals: user.boardProgress.Bronze.directReferrals || [],
            indirectReferrals: [],
            completed: user.boardProgress.Bronze.completed || false,
            completionDate: user.boardProgress.Bronze.completionDate,
            rewardsClaimed: user.boardProgress.Bronze.rewardsClaimed || false
          });
        }

        // Convert Silver board
        if (user.boardProgress.Silver) {
          boardProgressArray.push({
            boardType: 'silver',
            directReferrals: user.boardProgress.Silver.level1Referrals || [],
            indirectReferrals: user.boardProgress.Silver.level2Referrals || [],
            completed: user.boardProgress.Silver.completed || false,
            completionDate: user.boardProgress.Silver.completionDate,
            rewardsClaimed: user.boardProgress.Silver.rewardsClaimed || false
          });
        }

        // Convert Gold board
        if (user.boardProgress.Gold) {
          boardProgressArray.push({
            boardType: 'gold',
            directReferrals: user.boardProgress.Gold.level3Referrals || [],
            indirectReferrals: user.boardProgress.Gold.level4Referrals || [],
            completed: user.boardProgress.Gold.completed || false,
            completionDate: user.boardProgress.Gold.completionDate,
            rewardsClaimed: user.boardProgress.Gold.rewardsClaimed || false
          });
        }

        user.boardProgress = boardProgressArray;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save();
        migratedCount++;
      }
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateUsers();
}