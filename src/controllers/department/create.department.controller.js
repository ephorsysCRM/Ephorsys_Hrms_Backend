import asyncHandler from "express-async-handler";

import createDepartmentService from "../../services/department/create.department.service.js";
import ApiError from "../../utils/ApiError.js";

const createDepartmentController = asyncHandler(
    async (req, res) => {
        // =====================================================
        // CHECK AUTHENTICATED ADMIN
        // =====================================================

        if (!req.admin?._id) {
            throw new ApiError(
                401,
                "Authentication required"
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
                createdBy: req.admin._id,
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