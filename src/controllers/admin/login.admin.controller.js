import asyncHandler from "express-async-handler";

import loginAdminService from "../../services/admin/login.admin.service.js";

const loginAdminController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // =====================================================
    // 1. LOGIN ADMIN / HR / MANAGER / EMPLOYEE
    // =====================================================

    const { user, userType, token } = await loginAdminService(
        email,
        password
    );

    // =====================================================
    // 2. SET HTTP-ONLY AUTHENTICATION COOKIE
    // =====================================================

    res.cookie("token", token, {
        httpOnly: true,

        secure: process.env.NODE_ENV === "production",

        sameSite:
            process.env.NODE_ENV === "production"
                ? "strict"
                : "lax",

        maxAge: 7 * 24 * 60 * 60 * 1000,

        path: "/",
    });

    // =====================================================
    // 3. SEND LOGIN RESPONSE
    // =====================================================

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Login successful",

        data: {
            user,
            userType,
            role: user.role,
        },
    });
});

export default loginAdminController;