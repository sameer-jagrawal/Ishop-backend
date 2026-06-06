const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpMail = async (toEmail, otp) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required");
  }

  const { data, error } = await resend.emails.send({
    from: `Ishop Website <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
    to: [toEmail],
    subject: "Verify Your Email - OTP",
    html: `<h2>Your OTP is ${otp}</h2><p>This OTP is valid for 3 minutes.</p>`,
  });

  if (error) {
    console.log("Resend email error:", error);
    throw new Error(error.message || "Failed to send OTP email");
  }

  return data;
};

module.exports = sendOtpMail;