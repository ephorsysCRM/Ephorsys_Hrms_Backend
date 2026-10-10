import asyncHandler from "express-async-handler";

import updateDepartmentService from "../../services/department/update.department.service.js";

const updateDepartmentController = asyncHandler(
    async (req, res) => {
        const { id } = req.params;

        const department = await updateDepartmentService(
            id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Department updated successfully",
            data: {
                department,
            },
        });
    }
);

export default updateDepartmentController;