import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectToDatabase();

    // Parse JSON body
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "username is required" }, { status: 400 });
    }

    // Find user by username
    const user = await User.findOne({ username });

    // Security best practice: don't reveal whether the user exists
    if (!user) {
      return NextResponse.json(
        { email: null, message: "If the account exists, a reset email has been sent." },
        { status: 200 }
      );
    }

    // Return the user's email
    return NextResponse.json({ email: user.email }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
