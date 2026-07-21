"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
const resend_1 = require("resend");
const resend = process.env.RESEND_API_KEY
    ? new resend_1.Resend(process.env.RESEND_API_KEY)
    : null;
async function sendOtpEmail(email, otp) {
    if (!resend) {
        console.log(`[DEV] OTP for ${email}: ${otp}`);
        return;
    }
    await resend.emails.send({
        from: 'Briefly <noreply@bcone.com>',
        to: email,
        subject: '🔐 Your Briefly Password Reset Code',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#2563eb;padding:30px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;">
                Briefly
              </h1>
              <p style="margin:8px 0 0;color:#dbeafe;font-size:15px;">
                Secure Password Reset
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin-top:0;color:#111827;">
                Hello,
              </h2>

              <p style="color:#4b5563;font-size:16px;line-height:1.7;">
                We received a request to reset your password.
                Use the verification code below to continue.
              </p>

              <div style="margin:35px 0;text-align:center;">
                <div style="
                  display:inline-block;
                  background:#eff6ff;
                  color:#2563eb;
                  font-size:34px;
                  font-weight:bold;
                  letter-spacing:8px;
                  padding:18px 36px;
                  border-radius:10px;
                  border:2px dashed #2563eb;
                ">
                  ${otp}
                </div>
              </div>

              <p style="color:#4b5563;font-size:15px;line-height:1.7;">
                ⏳ This OTP is valid for <strong>10 minutes</strong>.
              </p>

              <p style="color:#4b5563;font-size:15px;line-height:1.7;">
                If you didn't request a password reset, you can safely ignore this email.
                Your account remains secure.
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:35px 0;">

              <p style="font-size:13px;color:#9ca3af;line-height:1.6;">
                For your security, never share this OTP with anyone.
                Briefly will never ask you for your verification code.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#6b7280;">
                © ${new Date().getFullYear()} Briefly. All rights reserved.
              </p>

              <p style="margin-top:8px;font-size:12px;color:#9ca3af;">
                This is an automated email. Please do not reply.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`,
    });
}
