import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';
// import { authOptions } from '../../../auth/options';

// 3 levels deep is usually sufficient for a quick visual
const MAX_DEPTH = 3; 

async function fetchDownlines(userId, depth = 1) {
  if (depth > MAX_DEPTH) return [];

  const directs = await User.find({ referredBy: userId })
    .select('username email currentBoard currentPlan status createdAt')
    .lean();

  if (directs.length === 0) return [];

  const results = await Promise.all(directs.map(async (direct) => {
    return {
      ...direct,
      level: depth,
      downlines: await fetchDownlines(direct._id, depth + 1)
    };
  }));

  return results;
}

export async function GET(request) {
  try {
    await connectToDatabase();
    
    // Auth Check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Always use session ID - users can only view their own tree
    const userId = session.user.id;
    const rootUser = await User.findById(userId).select('username currentBoard').lean();
    
    if (!rootUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tree = await fetchDownlines(userId);

    // Stats
    const countTotal = (nodes) => {
      let count = 0;
      for (const node of nodes) {
        count += 1 + countTotal(node.downlines || []);
      }
      return count;
    };

    return NextResponse.json({
      success: true,
      user: {
        username: rootUser.username,
        currentBoard: rootUser.currentBoard
      },
      stats: {
        totalDownlines: countTotal(tree),
        directReferrals: tree.length
      },
      downlines: tree
    });

  } catch (error) {
    console.error('Error fetching genealogy:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
