import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// POST handler
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, description } = body;

    // Create transporter (use environment variables for safety)
    const transporter = nodemailer.createTransport({
      service: "gmail", // or "smtp.your-email.com"
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Stockist Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Stockist Application",
      text: `
        Name: ${name}
        Email: ${email}
        Description: ${description}
      `,
      html: `
        <h2>New Stockist Application</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Description:</strong> ${description}</p>
      `,
    });

    return NextResponse.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ success: false, message: "Failed to send email." }, { status: 500 });
  }
}
