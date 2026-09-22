import crypto from "crypto";

import Admin from "../../model/admin.model.js";
import ApiError from "../../utils/ApiError.js";

const verifyOtpService = async (email, otp) => {
    const admin = await Admin.findOne({
        email: email.toLowerCase(),
    }).select(
        "+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordVerified"
    );

    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    if (!admin.resetPasswordOtp) {
        throw new ApiError(400, "OTP not found. Please request a new OTP");
    }

    if (
        !admin.resetPasswordOtpExpires ||
        admin.resetPasswordOtpExpires < new Date()
    ) {
        throw new ApiError(400, "OTP has expired. Please request a new OTP");
    }

    const hashedOtp = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    if (hashedOtp !== admin.resetPasswordOtp) {
        throw new ApiError(400, "Invalid OTP");
    }

    admin.resetPasswordVerified = true;

    await admin.save();

    return {
        email: admin.email,
    };
};

export default verifyOtpService;