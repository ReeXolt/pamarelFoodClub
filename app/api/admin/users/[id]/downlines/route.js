import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/options';

// Helper to recursively fetch downlines
// Depth limit to prevent infinite loops or timeout
const MAX_DEPTH = 3; 

async function fetchDownlines(userId, depth = 1) {
  if (depth > MAX_DEPTH) return [];

  // Find direct recruits
  const directs = await User.find({ referredBy: userId })
    .select('username email phone currentBoard currentPlan status createdAt')
    .lean();

  if (directs.length === 0) return [];

  // Recursively fetch for each direct
  const results = await Promise.all(directs.map(async (direct) => {
    return {
      ...direct,
      level: depth,
      downlines: await fetchDownlines(direct._id, depth + 1)
    };
  }));

  return results;
}

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    // Auth Check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if admin OR if viewing own downlines
    const isOwner = session.user.id === params.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = params.id;
    const rootUser = await User.findById(userId).select('username boardProgress').lean();
    
    if (!rootUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Identify user's current board context from their perspective
    // e.g. if they are on Silver, they care about Silver downlines logic
    
    // Fetch full tree
    const tree = await fetchDownlines(userId);

    // Calculate stats
    // Recursive count helper
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
        boardProgress: rootUser.boardProgress
      },
      stats: {
        totalDownlines: countTotal(tree),
        directReferrals: tree.length
      },
      downlines: tree
    });

  } catch (error) {
    console.error('Error fetching downlines:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
