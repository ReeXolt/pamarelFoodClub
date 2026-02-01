import User from "@/models/user";
import connectToDatabase from "@/lib/dbConnect";
import { authOptions } from "../../auth/options";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";


export async function PUT(request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response(JSON.stringify({
        success: false,
        message: "Unauthorized"
      }), { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();
    const user = await User.findById(session.user.id);

    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: "User not found"
      }), { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({
        success: false,
        message: "Current password is incorrect"
      }), { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return new Response(JSON.stringify({
      success: true,
      message: "Password updated successfully"
    }), { status: 200 });

  } catch (error) {
    console.error("Password update error:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Failed to update password"
    }), { status: 500 });
  }
}