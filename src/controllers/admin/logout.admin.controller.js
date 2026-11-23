
import asyncHandler from "express-async-handler";

const logoutAdminController = asyncHandler(async (req, res) => {
    const role = req.user?.role || "user";

    const logoutMessages = {
        super_admin: "Super Admin logout successful",
        admin: "Admin logout successful",
        hr: "HR logout successful",
        manager: "Manager logout successful",
        employee: "Employee logout successful",
    };

    const message =
        logoutMessages[role] || "Logout successful";

    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
            process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
        path: "/",
    });

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message,
    });
});

export default logoutAdminController;
