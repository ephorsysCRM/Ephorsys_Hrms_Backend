import bcrypt from "bcryptjs";

import Admin from "../../model/admin.model.js";
import ApiError from "../../utils/ApiError.js";

import generateToken from "../../utils/generateToken.js";

const loginAdminService = async (email, password) => {
    // ---------------------------------------------
    // Find Admin
    // ---------------------------------------------

    const admin = await Admin.findOne({
        email: email.toLowerCase(),
    }).select("+password");

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
    // Generate JWT
    // ---------------------------------------------

    const token = generateToken(admin);

    // ---------------------------------------------
    // Update Last Login
    // ---------------------------------------------

    admin.lastLogin = new Date();

    await admin.save();

    // ---------------------------------------------
    // Remove Sensitive Fields
    // ---------------------------------------------

    const adminData = admin.toObject();

    delete adminData.password;

    return {
        admin: adminData,
        token,
    };
};

export default loginAdminService;