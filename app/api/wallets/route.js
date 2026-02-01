import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/options";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ _id: session.user.id})
      .select('earnings')
      .lean();


    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const walletContent = {
      cash: user.earnings.cashWallet,
      food: user.earnings.foodWallet,
      gadget: user.earnings.gadgetsWallet
    }

    return NextResponse.json({ wallets: walletContent });
    
  } catch (error) {
    console.error('Wallets API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}