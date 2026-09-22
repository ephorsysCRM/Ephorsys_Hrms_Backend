import jwt from "jsonwebtoken";

export const generateAccessToken = (admin) => {
    return jwt.sign(
        {
            id: admin._id,
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

export const generateRefreshToken = (admin) => {
    return jwt.sign(
        {
            id: admin._id,
            tokenVersion: admin.tokenVersion,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:
                process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
        }
    );
};