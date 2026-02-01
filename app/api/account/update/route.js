import User from "@/models/user";
import connectToDatabase from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/options";


export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response(JSON.stringify({
        success: false,
        message: "Unauthorized"
      }), { status: 401 });
    }

    const { name, email } = await request.json();

    await connectToDatabase();


    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { username: name, email },
      { new: true }
    );

    if (!updatedUser) {
      return new Response(JSON.stringify({
        success: false,
        message: "User not found"
      }), { status: 404 });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Account updated successfully",
      user: {
        name: updatedUser.username,
        email: updatedUser.email
      }
    }), { status: 200 });

  } catch (error) {
    console.error("Account update error:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Failed to update account"
    }), { status: 500 });
  }
}