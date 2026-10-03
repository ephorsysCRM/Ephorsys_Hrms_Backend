import asyncHandler from "express-async-handler";

import loginAdminService from "../../services/admin/login.admin.service.js";

const loginAdminController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { admin, token } = await loginAdminService(
        email,
        password
    );

    // ---------------------------------------------
    // Set Authentication Cookie
    // ---------------------------------------------

    res.cookie("token", token, {
        httpOnly: true,

        secure: process.env.NODE_ENV === "production",

        sameSite:
            process.env.NODE_ENV === "production"
                ? "strict"
                : "lax",

        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Admin login successful",

        data: {
            admin,
        },
    });
});

export default loginAdminController;