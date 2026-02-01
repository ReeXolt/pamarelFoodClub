import User from '@/models/user';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';

// GET all users progress with filtering, sorting and pagination (Admin only)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 400 })
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "not Authorized" }, { status: 400 })
    }
    
    await connectToDatabase();

    const findUserAdmin = await User.findOne({ _id: session.user.id })

    if (!findUserAdmin) {
      return NextResponse.json({ error: "Not found user" }, { status: 404 })
    }

    if (findUserAdmin.role !== "admin") {
      return NextResponse.json({ error: "you are not an admin" }, { status: 400 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const plan = searchParams.get('plan') || 'all';
    const board = searchParams.get('board') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    let filter = {};
    
    // Search filter
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status !== 'all') {
      filter.status = status;
    }
    
    // Plan filter
    if (plan !== 'all') {
      filter.$or = [
        { plan: plan },
        { currentPlan: plan }
      ];
    }
    
    // Board filter
    if (board !== 'all') {
      filter.currentBoard = board.toLowerCase();
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch users with filtering, sorting and pagination
    const users = await User.find(filter)
      .populate('referredBy', 'username email referralCode')
      .populate('boardProgress.directReferrals', 'username email currentBoard')
      .populate('boardProgress.indirectReferrals', 'username email currentBoard')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    // Transform user data with proper board progress structure
    const formattedUsers = users.map(user => {
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode,
        currentBoard: user.currentBoard,
        plan: user.plan || user.currentPlan,
        earnings: user.earnings,
        wallets: user.wallets,
        referredBy: user.referredBy,
        boardProgress: user.boardProgress, // Keep the original array structure
        createdAt: user.createdAt,
        status: user.status,
        role: user.role
      };
    });

    return NextResponse.json({ 
      success: true, 
      users: formattedUsers,
      currentPage: page,
      totalPages,
      totalUsers,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Error fetching affiliates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}