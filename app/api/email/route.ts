// Import necessary libraries and dependencies
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// Set the SendGrid API key for sending emails
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Define the POST request handler
export async function POST(req: Request) {
  // Parse the incoming request JSON to extract email and candle data
  const { email, candleData } = await req.json();

  // Check if required parameters are present
  if (!email || !candleData) {
    return NextResponse.json(
      { error: "Missing required parameters." },
      { status: 400 }
    );
  }

  try {
    // Define the email content
    const msg = {
      to: email, // Recipient email
      from: process.env.SENDGRID_FROM_EMAIL!, // Sender email from environment variables
      subject: "Your Exported Candle Data", // Email subject
      text: `Here is your candle data:\n\n${JSON.stringify(
        // Email text
        candleData,
        null,
        2
      )}`,
      // Html message content
      html: `
        <h3>Your Exported Candle</h3>
        <p>Thank you for using our candle designer! Your candle is being processed and sent to be made by L'Arche.</p>
        <p><strong>ID:</strong> ${candleData.id}</p>
        <p><strong>Name:</strong> ${candleData.name}</p>
        <p><strong>Type:</strong> ${candleData.type}</p>
        <p><strong>Color:</strong> ${candleData.color}</p>
        <p><strong>Scent:</strong> ${candleData.scent}</p>
        <p><strong>Decor:</strong> ${candleData.decor}</p>
        <p><strong>Created At:</strong> ${candleData.created_at}</p>
        <p><strong>Category:</strong> ${candleData.category}</p>
      `,
    };

    // Send email using SendGrid
    await sgMail.send(msg);

    // Return success response
    return NextResponse.json({ message: "Email sent successfully!" });
  } catch (error) {
    // Log any errors with status 500
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 500 }
    );
  }
}
