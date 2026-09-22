import asyncHandler from "express-async-handler";

import forgotPasswordService from "../../services/admin/forgot.password.service.js";

const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await forgotPasswordService(email);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "OTP sent successfully to your registered email",
    data: result,
  });
});

export default forgotPasswordController;