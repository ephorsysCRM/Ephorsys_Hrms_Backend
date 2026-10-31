import asyncHandler from "express-async-handler";

import getAllDepartmentService from "../../services/department/get.all.department.service.js";

const getAllDepartmentController = asyncHandler(
    async (req, res) => {

        // =====================================================
        // PAGINATION QUERY
        // =====================================================

        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                Number(req.query.limit) || 10,
                1
            ),
            100
        );

        // =====================================================
        // SERVICE
        // =====================================================

        const data =
            await getAllDepartmentService(
                page,
                limit
            );

        // =====================================================
        // RESPONSE
        // =====================================================

        res.status(200).json({
            success: true,
            message:
                "Departments fetched successfully",
            data,
        });
    }
);

export default getAllDepartmentController;