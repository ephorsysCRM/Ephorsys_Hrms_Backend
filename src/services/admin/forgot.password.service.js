import crypto from "crypto";

import Admin from "../../model/admin.model.js";
import Employee from "../../model/employee.model.js";
import ApiError from "../../utils/ApiError.js";
import sendEmail from "../../utils/sendEmail.js";

// =====================================================
// FORGOT PASSWORD SERVICE
// Supports Admin, HR, Manager and Employee
// =====================================================

const forgotPasswordService = async (email) => {
    // =====================================================
    // 1. VALIDATE EMAIL
    // =====================================================

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
        throw new ApiError(400, "Email is required");
    }

    // =====================================================
    // 2. FIND ADMIN ACCOUNT
    // =====================================================

    let account = await Admin.findOne({
        email: normalizedEmail,
    }).select(
        "+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordVerified"
    );

    let userType = "admin";

    // =====================================================
    // 3. IF NOT ADMIN, FIND EMPLOYEE ACCOUNT
    // =====================================================

    if (!account) {
        account = await Employee.findOne({
            officialEmail: normalizedEmail,
        }).select(
            "+resetPasswordOtp +resetPasswordOtpExpires +resetPasswordVerified"
        );

        userType = "employee";
    }

    // =====================================================
    // 4. VALIDATE ACCOUNT
    // =====================================================

    if (!account) {
        throw new ApiError(
            404,
            "No account found with this email address"
        );
    }

    if (userType === "admin") {
        if (!account.isActive) {
            throw new ApiError(403, "Admin account is inactive");
        }

        if (account.isBlocked) {
            throw new ApiError(403, "Admin account is blocked");
        }
    } else {
        if (account.employmentStatus !== "active") {
            throw new ApiError(403, "Employee account is inactive");
        }
    }

    // =====================================================
    // 5. GENERATE 6-DIGIT OTP
    // =====================================================

    const otp = crypto.randomInt(100000, 1000000).toString();

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

    // =====================================================
    // 6. SAVE OTP
    // =====================================================

    account.resetPasswordOtp = hashedOtp;
    account.resetPasswordOtpExpires = otpExpires;
    account.resetPasswordVerified = false;

    await account.save();

    // =====================================================
    // 7. SEND OTP EMAIL
    // =====================================================

    const recipientEmail =
        userType === "admin"
            ? account.email
            : account.officialEmail;

    const recipientName =
        userType === "admin"
            ? account.name
            : `${account.firstName || ""} ${account.lastName || ""}`.trim();

    await sendEmail({
        to: recipientEmail,
        subject: "HRMS Password Reset OTP",
        html: `
            <div style="font-family: Arial, sans-serif; color: #222;">
                <h2>HRMS Password Reset</h2>

                <p>Hello ${recipientName || "User"},</p>

                <p>
                    We received a request to reset your HRMS password.
                </p>

                <p>Your verification OTP is:</p>

                <h1 style="letter-spacing: 8px;">${otp}</h1>

                <p>
                    This OTP will expire in ${expiresInMinutes} minutes.
                </p>

                <p>
                    If you did not request a password reset,
                    you can ignore this email.
                </p>

                <p>Regards,<br />HRMS Team</p>
            </div>
        `,
    });

    // =====================================================
    // 8. RETURN RESPONSE
    // =====================================================

    return {
        email: recipientEmail,
        userType,
    };
};

export default forgotPasswordService;