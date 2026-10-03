import asyncHandler from "express-async-handler";

const logoutAdminController = asyncHandler(async (req, res) => {
    // ---------------------------------------------
    // Clear Authentication Cookie
    // ---------------------------------------------

    res.clearCookie("token", {
        httpOnly: true,

        secure: process.env.NODE_ENV === "production",

        sameSite:
            process.env.NODE_ENV === "production"
                ? "strict"
                : "lax",
    });

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Admin logout successful",
    });
});

export default logoutAdminController;