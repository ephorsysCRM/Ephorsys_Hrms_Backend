import asyncHandler from "express-async-handler";

const logoutAdminController = asyncHandler(async (req, res) => {
    console.log("LOGOUT USER TYPE:", req.userType);
    console.log("LOGOUT USER ROLE:", req.user?.role);

    const role = String(req.user?.role || "").toLowerCase();

    const messages = {
        super_admin: "Super Admin logout successful",
        admin: "Admin logout successful",
        hr: "HR logout successful",
        manager: "Manager logout successful",
        employee: "Employee logout successful",
    };

    const message = messages[role] || "Logout successful";

    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
            process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/",
    });

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message,
    });
});

export default logoutAdminController;