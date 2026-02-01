import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/options';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Not Authorized" }, { status: 403 });
    }

    const { id } = await params;

    await connectToDatabase();

    // Verify admin exists
    const admin = await User.findById(session.user.id);
    if (!admin) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    // Fetch the user and populate board progress
    const user = await User.findById(id).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const boardProgress = user.boardProgress || [];

    // Helper to find the board progress object
    const getBoard = (board) =>
      boardProgress.find((bp) => bp.boardType === board) || { directReferrals: [], indirectReferrals: [] };

    const bronze = getBoard("bronze");
    const silver = getBoard("silver");
    const gold = getBoard("gold");
    const platinum = getBoard("platinum");

    return NextResponse.json({
      success: true,

      bronze: {
        directReferrals: bronze.directReferrals?.length || 0,
        completed: bronze.completed || false,
        totalRequired: 7,
      },

      silver: {
        level1Referrals: silver.directReferrals?.length || 0,   // Expect 7
        level2Referrals: silver.indirectReferrals?.length || 0, // Expect 49
        completed: silver.completed || false,
        level1Required: 7,
        level2Required: 49,
      },

      gold: {
        level1Referrals: gold.directReferrals?.length || 0,     // Expect 343
        level2Referrals: gold.indirectReferrals?.length || 0,   // Expect 2401
        completed: gold.completed || false,
        level1Required: 343,
        level2Required: 2401,
      },

      platinum: {
        completed: platinum.completed || false,
        totalRequired: 7,
      },

      networkSummary: {
        totalNetwork:
          (bronze.directReferrals?.length || 0) +
          (silver.directReferrals?.length || 0) +
          (silver.indirectReferrals?.length || 0) +
          (gold.directReferrals?.length || 0) +
          (gold.indirectReferrals?.length || 0),

        bronzeDirect: bronze.directReferrals?.length || 0,
        silverLevel1: silver.directReferrals?.length || 0,
        silverLevel2: silver.indirectReferrals?.length || 0,
        goldLevel1: gold.directReferrals?.length || 0,
        goldLevel2: gold.indirectReferrals?.length || 0,
      },

    });

  } catch (error) {
    console.error("Error calculating board progress:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
