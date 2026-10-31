import asyncHandler from "express-async-handler";

import getDepartmentByIdService from "../../services/department/get.department.by.id.service.js";

const getDepartmentByIdController = asyncHandler(
    async (req, res) => {

        // =====================================================
        // GET DEPARTMENT ID
        // =====================================================

        const { id } = req.params;

        // =====================================================
        // SERVICE
        // =====================================================

        const data =
            await getDepartmentByIdService(id);

        // =====================================================
        // RESPONSE
        // =====================================================

        res.status(200).json({
            success: true,
            message:
                "Department fetched successfully",
            data,
        });
    }
);

export default getDepartmentByIdController;