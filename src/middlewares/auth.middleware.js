import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import Admin from "../model/admin.model.js";
import ApiError from "../utils/ApiError.js";

const authMiddleware = async (req, res, next) => {
    try {
        // =====================================================
        // GET TOKEN FROM COOKIE
        // =====================================================

        const token = req.cookies?.token;

        if (!token) {
            throw new ApiError(
                401,
                "Authentication token is required"
            );
        }

        // =====================================================
        // VERIFY TOKEN
        // =====================================================

        let decodedToken;

        try {
            decodedToken = jwt.verify(
                token,
                process.env.JWT_SECRET
            );
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new ApiError(
                    401,
                    "Authentication token has expired"
                );
            }

            throw new ApiError(
                401,
                "Invalid authentication token"
            );
        }

        // =====================================================
        // VALIDATE ADMIN ID
        // =====================================================

        if (
            !decodedToken.id ||
            !mongoose.Types.ObjectId.isValid(
                decodedToken.id
            )
        ) {
            throw new ApiError(
                401,
                "Invalid admin authentication"
            );
        }

        // =====================================================
        // FIND ADMIN
        // =====================================================

        const admin = await Admin.findById(
            decodedToken.id
        ).select(
            "name email role phone profileImage isActive isBlocked"
        );

        if (!admin) {
            throw new ApiError(
                401,
                "Admin not found"
            );
        }

        // =====================================================
        // ACCOUNT STATUS
        // =====================================================

        if (!admin.isActive) {
            throw new ApiError(
                403,
                "Admin account is inactive"
            );
        }

        if (admin.isBlocked) {
            throw new ApiError(
                403,
                "Admin account is blocked"
            );
        }

        // =====================================================
        // SET ADMIN
        // =====================================================

        req.admin = admin;

        next();

    } catch (error) {
        next(error);
    }
};

export default authMiddleware;