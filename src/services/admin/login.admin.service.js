import bcrypt from "bcryptjs";

import Admin from "../../model/admin.model.js";
import ApiError from "../../utils/ApiError.js";

import {
    generateAccessToken,
    generateRefreshToken,
} from "../../utils/generateToken.js";

const loginAdminService = async (email, password) => {
    // ---------------------------------------------
    // Find Admin
    // ---------------------------------------------

    const admin = await Admin.findOne({
        email: email.toLowerCase(),
    }).select("+password +refreshToken");

    if (!admin) {
        throw new ApiError(401, "Invalid email or password");
    }

    // ---------------------------------------------
    // Check Account Status
    // ---------------------------------------------

    if (!admin.isActive) {
        throw new ApiError(403, "Admin account is inactive");
    }

    if (admin.isBlocked) {
        throw new ApiError(403, "Admin account is blocked");
    }

    // ---------------------------------------------
    // Compare Password
    // ---------------------------------------------

    const isPasswordMatch = await bcrypt.compare(
        password,
        admin.password
    );

    if (!isPasswordMatch) {
        throw new ApiError(401, "Invalid email or password");
    }

    // ---------------------------------------------
    // Generate Tokens
    // ---------------------------------------------

    const accessToken = generateAccessToken(admin);

    const refreshToken = generateRefreshToken(admin);

    // ---------------------------------------------
    // Save Refresh Token
    // ---------------------------------------------

    admin.refreshToken = refreshToken;
    admin.lastLogin = new Date();

    await admin.save();

    // ---------------------------------------------
    // Remove Sensitive Fields
    // ---------------------------------------------

    const adminData = admin.toObject();

    delete adminData.password;
    delete adminData.refreshToken;
    delete adminData.tokenVersion;

    return {
        admin: adminData,
        accessToken,
        refreshToken,
    };
};

export default loginAdminService;