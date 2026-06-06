const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetMail = async (toEmail, otp) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required");
  }

  const { data, error } = await resend.emails.send({
    from: `Ishop Website <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
    to: [toEmail],
    subject: "Reset Your IShop Password",
    html: `
      <div style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#111827;">
        <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
            <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">
              Reset your password
            </h2>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
              We received a request to reset the password for your <strong>IShop</strong> account.
              Use the code below to continue.
            </p>
            <div style="margin:24px 0;padding:18px;text-align:center;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Password reset code</p>
              <div style="font-size:34px;font-weight:700;letter-spacing:8px;color:#111827;">
                ${otp}
              </div>
            </div>
            <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#374151;">
              This code is valid for <strong>10 minutes</strong>. If you did not request a reset, you can safely ignore this email.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
              This is an automated security email from IShop. Please do not reply to this message.
            </p>
          </div>
          <p style="text-align:center;margin:16px 0 0;font-size:12px;color:#9ca3af;">
            © ${new Date().getFullYear()} IShop. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.log("Resend password reset email error:", error);
    throw new Error(error.message || "Failed to send password reset email");
  }

  return data;
};

module.exports = sendPasswordResetMail;
