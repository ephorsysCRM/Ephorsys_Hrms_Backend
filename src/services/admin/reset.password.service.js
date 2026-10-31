import bcrypt from "bcryptjs";

import Admin from "../../model/admin.model.js";
import Employee from "../../model/employee.model.js";
import ApiError from "../../utils/ApiError.js";

// =====================================================
// RESET PASSWORD — ADMIN / EMPLOYEE
// =====================================================

const resetPasswordService = async (email, newPassword) => {
    // 1. Validate input
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !newPassword) {
        throw new ApiError(
            400,
            "Email and new password are required"
        );
    }

    // 2. Find account
    let account = await Admin.findOne({
        email: normalizedEmail,
    }).select(
        "+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordVerified +refreshToken"
    );

    let userType = "admin";

    if (!account) {
        account = await Employee.findOne({
            officialEmail: normalizedEmail,
        }).select(
            "+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordVerified +refreshToken"
        );

        userType = "employee";
    }

    if (!account) {
        throw new ApiError(404, "Account not found");
    }

    // 3. Require OTP verification
    if (!account.resetPasswordVerified) {
        throw new ApiError(
            400,
            "Please verify OTP before resetting password"
        );
    }

    // 4. Ensure OTP is still valid
    if (
        !account.resetPasswordOtp ||
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

    // 5. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    account.password = hashedPassword;

    // 6. Clear OTP data
    account.resetPasswordOtp = null;
    account.resetPasswordOtpExpires = null;
    account.resetPasswordVerified = false;

    // 7. Invalidate existing tokens where supported
    if ("refreshToken" in account) {
        account.refreshToken = null;
    }

    if (typeof account.tokenVersion === "number") {
        account.tokenVersion += 1;
    }

    // 8. Save changes
    await account.save();

    // 9. Return result
    return {
        email: userType === "admin"
            ? account.email
            : account.officialEmail,
        userType,
    };
};

export default resetPasswordService;