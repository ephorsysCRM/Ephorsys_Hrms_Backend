import asyncHandler from "express-async-handler";
import logoutAdminService from "../../services/admin/logout.admin.service.js";

const logoutAdminController = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    await logoutAdminService(refreshToken);

    res.clearCookie("refreshToken", {
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