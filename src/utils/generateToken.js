import jwt from "jsonwebtoken";

// =====================================================
// GENERATE ACCESS TOKEN
// =====================================================

export const generateAccessToken = (admin) => {
    return jwt.sign(
        {
            id: admin._id.toString(),
            role: admin.role,
            email: admin.email,
            tokenVersion: admin.tokenVersion,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:
                process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
        }
    );
};

// =====================================================
// GENERATE REFRESH TOKEN
// =====================================================

export const generateRefreshToken = (admin) => {
    return jwt.sign(
        {
            id: admin._id.toString(),
            tokenVersion: admin.tokenVersion,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:
                process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
        }
    );
};