import User from "@/models/user";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/dbConnect";
import { authOptions } from "../../auth/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response(JSON.stringify({
        success: false,
        message: "Unauthorized"
      }), { status: 401 });
    }

    await connectToDatabase();


    const user = await User.findById(session.user.id).select('-password');

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: "User not found"
      }), { status: 404 });
    }

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        username: user.username,
        role: user.role
      }
    }), { status: 200 });

  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Failed to fetch user data"
    }), { status: 500 });
  }
}