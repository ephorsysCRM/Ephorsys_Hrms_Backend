import asyncHandler from "express-async-handler";

import getAllEmployeeService from "../../services/employee/getAllEmployee.service.js";

const getAllEmployeeController = asyncHandler(
    async (req, res) => {
        const {
            page = 1,
            limit = 10,
        } = req.query;

        const result =
            await getAllEmployeeService({
                page,
                limit,
            });

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message:
                "Employees fetched successfully",

            data: result,
        });
    }
);

export default getAllEmployeeController;