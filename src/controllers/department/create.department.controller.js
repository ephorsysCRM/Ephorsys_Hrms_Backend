import asyncHandler from "express-async-handler";

import createDepartmentService from "../../services/department/create.department.service.js";
import ApiError from "../../utils/ApiError.js";

const createDepartmentController = asyncHandler(
    async (req, res) => {

        // =====================================================
        // CHECK AUTHENTICATION
        // =====================================================

        if (!req.user?._id) {
            throw new ApiError(
                401,
                "Authentication required"
            );
        }

        // =====================================================
        // OPTIONAL ROLE CHECK
        // =====================================================
        // Only Admin and HR can create departments.
        // Normal employees cannot create departments.

        const allowedRoles = [
            "super_admin",
            "admin",
            "hr",
        ];

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403,
                "You are not authorized to create a department"
            );
        }

        // =====================================================
        // GET DATA
        // =====================================================

        const {
            name,
            code,
            description,
            status,
        } = req.body;

        // =====================================================
        // CREATE DEPARTMENT
        // =====================================================

        const department =
            await createDepartmentService({
                name,
                code,
                description,
                status,

                // Authenticated Admin or Employee/HR
                createdBy: req.user._id,
            });

        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: department,
        });
    }
);

export default createDepartmentController;