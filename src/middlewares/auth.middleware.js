import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import Admin from "../model/admin.model.js";
import Employee from "../model/employee.model.js";
import ApiError from "../utils/ApiError.js";

const authMiddleware = async (req, res, next) => {
    try {
        // =====================================================
        // 1. GET TOKEN FROM HTTP-ONLY COOKIE
        // =====================================================

        const token = req.cookies?.token;

        if (!token) {
            throw new ApiError(
                401,
                "Authentication token is required"
            );
        }

        // =====================================================
        // 2. VERIFY JWT TOKEN
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
        // 3. VALIDATE USER ID
        // =====================================================

        if (
            !decodedToken.id ||
            !mongoose.Types.ObjectId.isValid(decodedToken.id)
        ) {
            throw new ApiError(
                401,
                "Invalid authentication"
            );
        }

        // =====================================================
        // 4. VALIDATE USER TYPE
        // =====================================================

        const { userType } = decodedToken;

        if (!["admin", "employee"].includes(userType)) {
            throw new ApiError(
                401,
                "Invalid user type in authentication token"
            );
        }

        // =====================================================
        // 5. LOAD ADMIN OR EMPLOYEE
        // =====================================================

        if (userType === "admin") {
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

            // Check account status
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

            // Attach authenticated user to request
            req.admin = admin;
            req.user = admin;
            req.userType = "admin";

        } else {
            const employee = await Employee.findById(
                decodedToken.id
            ).select(
                "-password -bankAccountNumber -bankIFSC"
            );

            if (!employee) {
                throw new ApiError(
                    401,
                    "Employee not found"
                );
            }

            // Check employment status
            if (employee.employmentStatus !== "active") {
                throw new ApiError(
                    403,
                    "Employee account is inactive"
                );
            }

            // Attach authenticated user to request
            req.employee = employee;
            req.user = employee;
            req.userType = "employee";
        }

        // =====================================================
        // 6. CONTINUE
        // =====================================================

        next();

    } catch (error) {
        next(error);
    }
};

export default authMiddleware;