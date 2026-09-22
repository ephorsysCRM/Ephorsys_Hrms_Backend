import asyncHandler from "express-async-handler";

import refreshTokenService from "../../services/admin/refresh.token.service.js";

const refreshTokenController = asyncHandler(async (req, res) => {
  // ---------------------------------------------
  // Get Refresh Token From Cookie
  // ---------------------------------------------

  const refreshToken = req.cookies?.refreshToken;

  // ---------------------------------------------
  // Generate New Tokens
  // ---------------------------------------------

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshTokenService(refreshToken);

  // ---------------------------------------------
  // Set New Refresh Token Cookie
  // ---------------------------------------------

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Access token refreshed successfully",
    data: {
      accessToken,
    },
  });
});

export default refreshTokenController;