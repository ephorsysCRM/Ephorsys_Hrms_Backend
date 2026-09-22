import bcrypt from "bcryptjs";

import Admin from "../../model/admin.model.js";
import ApiError from "../../utils/ApiError.js";

const resetPasswordService = async (
    email,
    newPassword
) => {
    const admin = await Admin.findOne({
        email: email.toLowerCase(),
    }).select(
        "+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordVerified +refreshToken"
    );

    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    if (!admin.resetPasswordVerified) {
        throw new ApiError(
            400,
            "Please verify OTP before resetting password"
        );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    admin.password = hashedPassword;

    // Clear reset password data
    admin.resetPasswordOtp = null;
    admin.resetPasswordOtpExpires = null;
    admin.resetPasswordVerified = false;

    // Invalidate existing refresh tokens
    admin.refreshToken = null;

    // Invalidate existing access/refresh token versions
    admin.tokenVersion += 1;

    await admin.save();

    return {
        email: admin.email,
    };
};

export default resetPasswordService;