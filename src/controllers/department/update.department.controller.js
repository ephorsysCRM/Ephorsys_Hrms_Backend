import asyncHandler from "express-async-handler";

import updateDepartmentService from "../../services/department/update.department.service.js";

const updateDepartmentController = asyncHandler(
    async (req, res) => {

        // =====================================================
        // GET DEPARTMENT ID
        // =====================================================

        const { id } = req.params;

        // =====================================================
        // UPDATE DEPARTMENT
        // =====================================================

        const department =
            await updateDepartmentService(
                id,
                req.body
            );

        // =====================================================
        // RESPONSE
        // =====================================================

        res.status(200).json({
            success: true,
            message:
                "Department updated successfully",
            data: department,
        });
    }
);

export default updateDepartmentController;