import User from "@/models/user";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/dbConnect";
import { uploadImage } from "@/utils/upload";
import { authOptions } from "../auth/options";
import { NextResponse } from "next/server";



export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    const uploads = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploaded = await uploadImage(buffer);
        return uploaded.secure_url;
      })
    );


    return NextResponse.json({ message: "Uploaded successfully", urls: uploads }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}