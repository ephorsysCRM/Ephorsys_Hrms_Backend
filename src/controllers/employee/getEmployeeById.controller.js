import mongoose from "mongoose";
import asyncHandler from "express-async-handler";

import getEmployeeByIdService from "../../services/employee/getEmployeeById.service.js";

const getEmployeeByIdController =
    asyncHandler(async (req, res) => {
        const { id } = req.params;

        // ============================================
        // VALIDATE EMPLOYEE ID
        // ============================================

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message:
                    "Invalid employee ID",
                errors: [],
            });
        }

        // ============================================
        // GET EMPLOYEE
        // ============================================

        const employee =
            await getEmployeeByIdService(id);

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message:
                "Employee fetched successfully",
            data: {
                employee,
            },
        });
    });

export default getEmployeeByIdController;