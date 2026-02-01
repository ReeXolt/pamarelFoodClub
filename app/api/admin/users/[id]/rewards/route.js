import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import BoardCompletion from '@/models/BoardCompletion';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';
import User from '@/models/user';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    await connectToDatabase();

    const { id } = await params;
    
    // Check if user exists (optional but good practice)
    const user = await User.findById(id);
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const completions = await BoardCompletion.find({ user: id }).sort({ completionDate: -1 });

    return NextResponse.json({ 
      success: true, 
      rewards: completions 
    });

  } catch (error) {
    console.error('Error fetching user rewards:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
