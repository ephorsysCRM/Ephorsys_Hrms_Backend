import asyncHandler from "express-async-handler";

import verifyOtpService from "../../services/admin/verify.otp.service.js";

const verifyOtpController = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const result = await verifyOtpService(email, otp);

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "OTP verified successfully",
        data: result,
    });
});

export default verifyOtpController;