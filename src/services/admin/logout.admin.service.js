import asyncHandler from "express-async-handler";

// =====================================================
// LOGOUT — ROLE-BASED MESSAGE
// =====================================================

const logoutAdminController = asyncHandler(async (req, res) => {
    const role = req.user?.role || "user";

    // Role-based logout messages
    const logoutMessages = {
        super_admin: "Super Admin logout successful",
        admin: "Admin logout successful",
        hr: "HR logout successful",
        manager: "Manager logout successful",
        employee: "Employee logout successful",
    };

    const message =
        logoutMessages[role] || "Logout successful";

    // Clear HTTP-only authentication cookie
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
            process.env.NODE_ENV === "production"
                ? "strict"
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