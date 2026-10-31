import asyncHandler from "express-async-handler";

import deleteDepartmentService from "../../services/department/delete.department.service.js";

const deleteDepartmentController = asyncHandler(
    async (req, res) => {

        // =====================================================
        // GET DEPARTMENT ID
        // =====================================================

        const { id } = req.params;

        // =====================================================
        // DELETE DEPARTMENT
        // =====================================================

        await deleteDepartmentService(id);

        // =====================================================
        // RESPONSE
        // =====================================================

        res.status(200).json({
            success: true,
            message:
                "Department deleted successfully",
        });
    }
);

export default deleteDepartmentController;