const nodemailer = require("nodemailer");

const sendOtpMail = async (toEmail, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("SMTP Connected");


    const mailOptions = {
      from: `"Ishop Website" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Verify Your Email - OTP",
      html: `
      <div style="font-family: Arial, sans-serif; background:#f4f7f7; padding:40px 20px;">

      <div style="
        max-width:600px;
        margin:auto;
        background:white;
        border-radius:20px;
        padding:40px 30px;
        box-shadow:0 4px 20px rgba(0,0,0,0.08);
        text-align:center;
      ">
    
        <h1 style="
          color:#01A49E;
          margin-bottom:10px;
          font-size:32px;
        ">
          🛍️ IShop
        </h1>
    
        <h2 style="
          color:#222;
          margin-bottom:20px;
          font-size:26px;
        ">
          Verify Your Email Address
        </h2>
    
        <p style="
          color:#555;
          font-size:16px;
          line-height:1.7;
          margin-bottom:25px;
        ">
          Welcome to <b>IShop</b> 🎉 <br/>
          Thank you for creating your account.
          To complete your registration and secure your account,
          please use the verification code below.
        </p>
    
        <div style="
          background:#f1fffe;
          border:2px dashed #01A49E;
          border-radius:16px;
          padding:20px;
          margin:30px 0;
        ">
    
          <p style="
            margin:0;
            color:#666;
            font-size:14px;
          ">
            Your OTP Code
          </p>
    
          <h1 style="
            letter-spacing:10px;
            color:#01A49E;
            font-size:42px;
            margin:10px 0 0;
          ">
            ${otp}
          </h1>
    
        </div>
    
        <p style="
          color:#444;
          font-size:15px;
          line-height:1.7;
          margin-bottom:20px;
        ">
          ⏳ This OTP is valid for
          <b>3 minutes</b>.
        </p>
    
        <p style="
          color:#777;
          font-size:14px;
          line-height:1.7;
        ">
          🔒 For your security, never share this OTP with anyone.
          Our team will never ask for your verification code.
        </p>
    
        <hr style="
          border:none;
          border-top:1px solid #eee;
          margin:30px 0;
        "/>
    
        <p style="
          color:#999;
          font-size:13px;
          line-height:1.6;
        ">
          If you did not request this email,
          you can safely ignore it.
        </p>
    
        <p style="
          margin-top:25px;
          color:#01A49E;
          font-weight:bold;
          font-size:15px;
        ">
          ❤️ Thank you for choosing IShop
        </p>
    
      </div>
    
    </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return "OTP Email sent successfully";

  } catch (error) {
    console.log(error)
    return "Email sending failed: " + error.message;
  }
};

module.exports = sendOtpMail;