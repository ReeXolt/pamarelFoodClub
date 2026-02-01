import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";


export async function POST(request) {
  try {
    const { username, token } = await request.json();

    if (!username || !token) {
      return NextResponse.json(
        { success: false, message: "Username and token are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ username });

    if (!user) {
      // Return generic success to avoid revealing registered emails
      return NextResponse.json(
        { success: true, message: "If an account exists with this email, a reset link has been sent" },
        { status: 200 }
      );
    }

    const expireToken = Date.now() + 3600000; // 1 hour

    user.verifyToken = token;
    user.expireToken = new Date(expireToken);
    await user.save();

    return NextResponse.json(
      { success: true, message: "Token saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
