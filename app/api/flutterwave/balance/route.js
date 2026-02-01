import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";
import User from "@/models/user";
import connectToDatabase from "@/lib/dbConnect";

export async function GET() {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "not authenticated" }, { status: 400 });
    }
    if (!session.user.id) {
      return NextResponse.json({ error: "invalid session" }, { status: 400 });
    }

    const findUser = await User.findOne({ _id: session.user.id });

    if (!findUser) {
      return NextResponse.json({ error: "not authenticated" }, { status: 400 });
    }

    if (findUser.role !== "admin") {
      return NextResponse.json({ error: "you are not authorized" }, { status: 400 });
    }

    const response = await fetch("https://api.flutterwave.com/v3/balances", {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Flutterwave balance");
    }

    const data = await response.json();

    // ✅ Filter only the NGN wallet
    const ngnWallet = data?.data?.find(
      (wallet) => wallet.currency === "NGN"
    ) || { currency: "NGN", available_balance: 0, ledger_balance: 0 };

    return NextResponse.json({
      currency: ngnWallet.currency,
      available_balance: ngnWallet.available_balance,
      ledger_balance: ngnWallet.ledger_balance,
      growthRate: 0, // Optional placeholder for your logic
    });
  } catch (error) {
    console.error("Error fetching Flutterwave balance:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
