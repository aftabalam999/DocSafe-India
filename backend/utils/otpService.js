const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, name) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `DocSafe India <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
      to: [email],
      subject: 'Verify Your Account - DocSafe India',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4ff; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(99,102,241,0.12); }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 36px 32px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
          .body { padding: 36px 32px; }
          .body p { color: #374151; font-size: 15px; line-height: 1.6; }
          .otp-box { text-align: center; margin: 28px 0; }
          .otp { display: inline-block; font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #6366f1; background: #eef2ff; padding: 16px 32px; border-radius: 12px; border: 2px dashed #a5b4fc; }
          .note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 13px; color: #92400e; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; background: #f8fafc; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 DocSafe India</h1>
            <p>Secure Document Management</p>
          </div>
          <div class="body">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Welcome to <strong>DocSafe India</strong>! Use the OTP below to verify your email address and activate your account.</p>
            <div class="otp-box">
              <div class="otp">${otp}</div>
            </div>
            <div class="note">
              ⚠️ This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.
            </div>
            <p style="margin-top:20px; color:#6b7280; font-size:13px;">If you did not create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            © 2025 DocSafe India. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
    });

    if (error) {
      console.error('Resend Error:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error('Email Service Error:', err.message);
    throw err;
  }
};

const sendForgotPasswordEmail = async (email, otp, name) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `DocSafe India <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
      to: [email],
      subject: 'Password Reset OTP - DocSafe India',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4ff; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(99,102,241,0.12); }
          .header { background: linear-gradient(135deg, #ef4444, #f97316); padding: 36px 32px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
          .body { padding: 36px 32px; }
          .body p { color: #374151; font-size: 15px; line-height: 1.6; }
          .otp-box { text-align: center; margin: 28px 0; }
          .otp { display: inline-block; font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #ef4444; background: #fef2f2; padding: 16px 32px; border-radius: 12px; border: 2px dashed #fca5a5; }
          .note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 13px; color: #92400e; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; background: #f8fafc; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>DocSafe India Security</p>
          </div>
          <div class="body">
            <p>Hello <strong>${name}</strong>,</p>
            <p>We received a request to reset your password for your <strong>DocSafe India</strong> account. Use the OTP below to reset it.</p>
            <div class="otp-box">
              <div class="otp">${otp}</div>
            </div>
            <div class="note">
              ⚠️ This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.
            </div>
            <p style="margin-top:20px; color:#6b7280; font-size:13px;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            © 2025 DocSafe India. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
    });

    if (error) {
      console.error('Resend Error:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error('Email Service Error:', err.message);
    throw err;
  }
};

module.exports = { generateOTP, sendOTPEmail, sendForgotPasswordEmail };
