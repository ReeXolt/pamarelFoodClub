import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/options";

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, subject, message } = body;


    const session = getServerSession(authOptions);

    if (!session) {
        return new Response(
            JSON.stringify({ success: false, message: "You are not logged in" }),
            { status: 400 }
        );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: subject || "New Contact Form Submission",
      text: `
        You have a new message from your website:
        
        Name: ${firstName} ${lastName}
        Email: ${email}
        Subject: ${subject}
        Message: ${message}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to send email." }),
      { status: 500 }
    );
  }
}
