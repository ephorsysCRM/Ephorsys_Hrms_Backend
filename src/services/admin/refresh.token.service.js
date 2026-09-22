import jwt from "jsonwebtoken";

import Admin from "../../model/admin.model.js";
import ApiError from "../../utils/ApiError.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateToken.js";

const refreshTokenService = async (refreshToken) => {
  // ---------------------------------------------
  // Check Refresh Token
  // ---------------------------------------------

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  // ---------------------------------------------
  // Verify Refresh Token
  // ---------------------------------------------

  let decodedToken;

  try {
    decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Refresh token has expired");
    }

    throw new ApiError(401, "Invalid refresh token");
  }

  // ---------------------------------------------
  // Find Admin
  // ---------------------------------------------

  const admin = await Admin.findById(decodedToken.id).select(
    "+refreshToken"
  );

  if (!admin) {
    throw new ApiError(401, "Admin not found");
  }

  // ---------------------------------------------
  // Check Account Status
  // ---------------------------------------------

  if (!admin.isActive) {
    throw new ApiError(403, "Admin account is inactive");
  }

  if (admin.isBlocked) {
    throw new ApiError(403, "Admin account is blocked");
  }

  // ---------------------------------------------
  // Check Token Version
  // ---------------------------------------------

  if (decodedToken.tokenVersion !== admin.tokenVersion) {
    throw new ApiError(401, "Refresh token is no longer valid");
  }

  // ---------------------------------------------
  // Compare Refresh Token
  // ---------------------------------------------

  if (admin.refreshToken !== refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // ---------------------------------------------
  // Generate New Tokens
  // ---------------------------------------------

  const newAccessToken = generateAccessToken(admin);

  const newRefreshToken = generateRefreshToken(admin);

  // ---------------------------------------------
  // Update Refresh Token
  // ---------------------------------------------

  admin.refreshToken = newRefreshToken;

  await admin.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export default refreshTokenService;