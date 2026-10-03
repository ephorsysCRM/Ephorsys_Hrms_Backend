import ApiError from "../utils/ApiError.js";

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // =====================================================
        // 1. CHECK AUTHENTICATION
        // =====================================================

        if (!req.user) {
            return next(
                new ApiError(
                    401,
                    "Authentication required"
                )
            );
        }

        // =====================================================
        // 2. CHECK USER ROLE
        // =====================================================

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new ApiError(
                    403,
                    "You are not authorized to perform this action"
                )
            );
        }

        // =====================================================
        // 3. ACCESS GRANTED
        // =====================================================

        next();
    };
};

export default authorizeRoles;