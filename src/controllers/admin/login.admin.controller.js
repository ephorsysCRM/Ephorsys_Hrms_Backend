
import asyncHandler from "express-async-handler";

import loginAdminService from "../../services/admin/login.admin.service.js";

const loginAdminController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Login Admin / HR / Employee
    const { user, userType, token } = await loginAdminService(
        email,
        password
    );

    // Set HTTP-only authentication cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
            process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
    });

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
