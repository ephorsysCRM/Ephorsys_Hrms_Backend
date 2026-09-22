import jwt from "jsonwebtoken";
import Admin from "../model/admin.model.js";
import ApiError from "../utils/ApiError.js";

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Authentication token is required");
        }

        const accessToken = authHeader.split(" ")[1];

        if (!accessToken) {
            throw new ApiError(401, "Authentication token is required");
        }

        let decodedToken;

        try {
            decodedToken = jwt.verify(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET
            );
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new ApiError(401, "Access token has expired");
            }

            throw new ApiError(401, "Invalid access token");
        }

        const admin = await Admin.findById(decodedToken.id).select(
            "name email role isActive isBlocked tokenVersion"
        );

        if (!admin) {
            throw new ApiError(401, "Admin not found");
        }

        if (!admin.isActive) {
            throw new ApiError(403, "Admin account is inactive");
        }

        if (admin.isBlocked) {
            throw new ApiError(403, "Admin account is blocked");
        }

        if (decodedToken.tokenVersion !== admin.tokenVersion) {
            throw new ApiError(
                401,
                "Access token is no longer valid. Please login again"
            );
        }

        req.admin = admin;

        next();
    } catch (error) {
        next(error);
    }
};

export default authMiddleware;