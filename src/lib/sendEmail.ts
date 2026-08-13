import nodemailer from "nodemailer";
import config from "../core/config/config";


interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface EmailResponse {
  success: boolean;
  error?: string;
}


const sendEmail = async ({
  to,
  subject,
  html,
}: EmailOptions): Promise<EmailResponse> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: config.email.from,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error: unknown) {
    console.error("Email send error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export default sendEmail;