import crypto from "crypto";

import Admin from "../../model/admin.model.js";
import Employee from "../../model/employee.model.js";
import ApiError from "../../utils/ApiError.js";

// =====================================================
// VERIFY OTP — ADMIN / EMPLOYEE
// =====================================================

const verifyOtpService = async (email, otp) => {
    // 1. Validate input
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    // 2. Find account
    let account = await Admin.findOne({
        email: normalizedEmail,
    }).select(
        "+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordVerified"
    );

    let userType = "admin";

    if (!account) {
        account = await Employee.findOne({
            officialEmail: normalizedEmail,
        }).select(
            "+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordVerified"
        );

        userType = "employee";
    }

    if (!account) {
        throw new ApiError(404, "Account not found");
    }

    // 3. Check OTP exists
    if (!account.resetPasswordOtp) {
        throw new ApiError(
            400,
            "OTP not found. Please request a new OTP"
        );
    }

    // 4. Check OTP expiry
    if (
        !account.resetPasswordOtpExpires ||
        account.resetPasswordOtpExpires < new Date()
    ) {
        account.resetPasswordOtp = null;
        account.resetPasswordOtpExpires = null;
        account.resetPasswordVerified = false;

        await account.save();

        throw new ApiError(
            400,
            "OTP has expired. Please request a new OTP"
        );
    }

    // 5. Hash submitted OTP
    const hashedOtp = crypto
        .createHash("sha256")
        .update(String(otp).trim())
        .digest("hex");

    // 6. Compare OTP
    if (hashedOtp !== account.resetPasswordOtp) {
        throw new ApiError(400, "Invalid OTP");
    }

    // 7. Mark OTP verified
    account.resetPasswordVerified = true;

    await account.save();

    // 8. Return result
    return {
        email: userType === "admin"
            ? account.email
            : account.officialEmail,
        userType,
    };
};

export default verifyOtpService;