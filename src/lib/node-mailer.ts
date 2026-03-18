import nodemailer from 'nodemailer'

import dotenv from "dotenv";
dotenv.config();
import { AppError } from '../AppError';
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST as string,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true para 465, false para otros
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token:string) => {
  const url = `http://${process.env.FRONTEND_URL}/verify?token=${encodeURIComponent(token)}`

  console.log("did we get here")
  try{
   const transport=   await transporter.sendMail({
    from: `"Sistema Inventario" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verifica tu cuenta",
    html: `<b>Haz click aquí para verificar:</b> <a href="${url}">${url}</a>`,
  });
console.log(transport, "transport")
  } catch (err: any) {
    console.error(`Email sending failed:`, err);
  // Common Nodemailer error codes: EAUTH, ECONNECTION, ETIMEDOUT
  if (err.code === 'EAUTH') {
    console.error("Authentication failed: Check SMTP_USER and SMTP_PASS.");
  } else if (err.code === 'ESOCKET') {
    console.error("Network issue: Check if the port/host is blocked by a firewall.");
  } else {
    console.error(`Email error: ${err.message}`, "THEE ERROR");
  }
   throw new AppError("Failed to send verification email. Please try again.", 500);
}
 
};
