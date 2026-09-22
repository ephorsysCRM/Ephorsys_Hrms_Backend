import asyncHandler from "express-async-handler";

import resetPasswordService from "../../services/admin/reset.password.service.js";

const resetPasswordController = asyncHandler(async (req, res) => {
    const {
        email,
        newPassword,
    } = req.body;

    const result = await resetPasswordService(
        email,
        newPassword
    );

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Password reset successfully",
        data: result,
    });
});

export default resetPasswordController;