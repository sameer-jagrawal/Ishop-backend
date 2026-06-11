const BREVO_TRANSACTIONAL_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

const getSender = () => {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL is required");
  }

  return {
    name: process.env.BREVO_SENDER_NAME || "IShop Website",
    email: senderEmail,
  };
};

const sendBrevoMail = async ({ toEmail, subject, htmlContent }) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is required");
  }

  if (!toEmail || !subject || !htmlContent) {
    throw new Error("Email recipient, subject and HTML content are required");
  }

  const response = await fetch(BREVO_TRANSACTIONAL_EMAIL_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: getSender(),
      to: [{ email: toEmail }],
      subject,
      htmlContent,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Brevo email request failed with status ${response.status}`;

    console.error("Brevo email error:", {
      status: response.status,
      message,
    });

    throw new Error(message);
  }

  return payload;
};

module.exports = sendBrevoMail;
