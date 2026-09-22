import bcrypt from "bcryptjs";

import Admin from "../../model/admin.model.js";
import ApiError from "../../utils/ApiError.js";

const createAdminService = async (adminData) => {
    const {
        name,
        email,
        password,
        phone,
        profileImage,
        role,
    } = adminData;

    // ---------------------------------------------
    // Check Existing Admin
    // ---------------------------------------------

    const existingAdmin = await Admin.findOne({
        email: email.toLowerCase(),
    });

    if (existingAdmin) {
        throw new ApiError(
            409,
            "Admin with this email already exists"
        );
    }

    // ---------------------------------------------
    // Hash Password
    // ---------------------------------------------

    const hashedPassword = await bcrypt.hash(password, 12);

    // ---------------------------------------------
    // Create Admin
    // ---------------------------------------------

    const admin = await Admin.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        profileImage,
        role,
    });

    // ---------------------------------------------
    // Remove Sensitive Fields
    // ---------------------------------------------

    const createdAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken -tokenVersion"
    );

    return createdAdmin;
};

export default createAdminService;