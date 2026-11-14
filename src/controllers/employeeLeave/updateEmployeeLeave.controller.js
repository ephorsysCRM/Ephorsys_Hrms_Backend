
import asyncHandler from "express-async-handler";

import updateEmployeeLeaveService from "../../services/employeeLeave/updateEmployeeLeave.service.js";

const updateEmployeeLeaveController = asyncHandler(
    async (req, res) => {
        // Only Admin and HR can update leave
        const role = String(req.user?.role || "").toLowerCase();

        if (!["admin", "hr"].includes(role)) {
            return res.status(403).json({
                success: false,
                message: "Only Admin and HR can update employee leave.",
            });
        }

        const leave = await updateEmployeeLeaveService(
            req.params.employeeId,
            req.params.year,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Employee leave updated successfully.",
            data: {
                leave,
            },
        });
    }
);

export default updateEmployeeLeaveController;
