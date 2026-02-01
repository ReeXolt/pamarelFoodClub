import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      orderId,
      product,
      issueType,
      subject,
      description,
      urgency,
      attachments,
    } = body;

    // Configure mail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // or SMTP settings
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Format email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: subject || "New Report Submission",
      text: `
        New report submitted:

        Name: ${name}
        Email: ${email}
        Order ID: ${orderId}
        Product: ${product}
        Issue Type: ${issueType}
        Urgency: ${urgency}

        Description:
        ${description}
      `,
      // Optional: handle attachments (if you're sending Base64/file objects from frontend)
      attachments: attachments
        ? attachments.map((file) => ({
            filename: file.name,
            content: Buffer.from(file.data, "base64"),
          }))
        : [],
    };

    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ success: true, message: "Report sent successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Report email error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to send report." }),
      { status: 500 }
    );
  }
}
