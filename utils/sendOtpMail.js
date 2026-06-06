const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpMail = async (toEmail, otp) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER and EMAIL_PASS environment variables are required");
    }

    const mailOptions = {
      from: `"Ishop Website" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Verify Your Email - OTP",
      html: `<h2>Your OTP is ${otp}</h2>`,
    };

    await transporter.sendMail(mailOptions);
    return "OTP Email sent successfully";
  } catch (error) {
    console.log("OTP email error:", error.message);
    throw error;
  }
};

module.exports = sendOtpMail;