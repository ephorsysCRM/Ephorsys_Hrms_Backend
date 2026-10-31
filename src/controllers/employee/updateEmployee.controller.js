import asyncHandler from "express-async-handler";

import updateEmployeeService from "../../services/employee/updateEmployee.service.js";

const updateEmployeeController = asyncHandler(
    async (req, res) => {
        const { id } = req.params;

        const employee = await updateEmployeeService(
            id,
            req.body,
            req.files
        );

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Employee updated successfully",
            data: {
                employee,
            },
        });
    }
);

export default updateEmployeeController;