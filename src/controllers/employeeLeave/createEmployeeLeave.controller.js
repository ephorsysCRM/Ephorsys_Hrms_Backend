import asyncHandler from "express-async-handler";

import createEmployeeLeaveService from "../../services/employeeLeave/createEmployeeLeave.service.js";

const createEmployeeLeaveController = asyncHandler(
    async (req, res) => {
        const role = String(req.user?.role || "").toLowerCase();

        if (!["admin", "hr"].includes(role)) {
            return res.status(403).json({
                success: false,
                message: "Only Admin and HR can assign employee leave.",
            });
        }

        const assignedBy = req.user?._id || req.user?.id;

        if (!assignedBy) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user ID not found.",
            });
        }

        const leave = await createEmployeeLeaveService(
            {
                ...req.body,
                employeeId: req.params.employeeId,
            },
            assignedBy
        );

        return res.status(201).json({
            success: true,
            message: "Employee leave assigned successfully.",
            data: {
                leave,
            },
        });
    }
);

export default createEmployeeLeaveController;