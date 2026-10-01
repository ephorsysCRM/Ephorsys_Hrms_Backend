import ApiError from "../utils/ApiError.js";

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // =====================================================
        // CHECK AUTHENTICATION
        // =====================================================

        if (!req.admin) {
            return next(
                new ApiError(
                    401,
                    "Authentication required"
                )
            );
        }

        // =====================================================
        // CHECK ROLE
        // =====================================================

        if (!allowedRoles.includes(req.admin.role)) {
            return next(
                new ApiError(
                    403,
                    "You are not authorized to perform this action"
                )
            );
        }

        // =====================================================
        // ACCESS GRANTED
        // =====================================================

        next();
    };
};

export default authorizeRoles;