import crypto from "crypto";

import Admin from "../../model/admin.model.js";
import ApiError from "../../utils/ApiError.js";
import sendEmail from "../../utils/sendEmail.js";

const forgotPasswordService = async (email) => {
    const admin = await Admin.findOne({
        email: email.toLowerCase(),
    }).select(
        "+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordVerified"
    );

    if (!admin) {
        throw new ApiError(404, "Admin with this email does not exist");
    }

    if (!admin.isActive) {
        throw new ApiError(403, "Admin account is inactive");
    }

    if (admin.isBlocked) {
        throw new ApiError(403, "Admin account is blocked");
    }

    // Generate 6 digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP before storing
    const hashedOtp = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    const expiresInMinutes = Number(
        process.env.OTP_EXPIRES_IN_MINUTES || 10
    );

    const otpExpires = new Date(
        Date.now() + expiresInMinutes * 60 * 1000
    );

    admin.resetPasswordOtp = hashedOtp;
    admin.resetPasswordOtpExpires = otpExpires;
    admin.resetPasswordVerified = false;

    await admin.save();

    await sendEmail({
        to: admin.email,
        subject: "HRMS Password Reset OTP",
        html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>HRMS Password Reset</h2>

        <p>Hello ${admin.name},</p>

        <p>
          We received a request to reset your HRMS admin password.
        </p>

        <p>Your OTP is:</p>

        <h1 style="letter-spacing: 8px;">
          ${otp}
        </h1>

        <p>
          This OTP will expire in ${expiresInMinutes} minutes.
        </p>

        <p>
          If you did not request a password reset, please ignore this email.
        </p>

        <p>Regards,<br />HRMS Team</p>
      </div>
    `,
    });

    return {
        email: admin.email,
    };
};

export default forgotPasswordService;