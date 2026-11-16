
import asyncHandler from "express-async-handler";

import applyLeaveService from "../../services/employeeLeave/applyLeave.service.js";

const applyLeaveController = asyncHandler(async (req, res) => {
    // Employee and HR can apply for their own leave.
    // Employee ID is taken from authenticated user, not request body.
    const employeeId = req.user?._id;

    if (!employeeId) {
        return res.status(401).json({
            success: false,
            message: "Authenticated employee ID not found.",
        });
    }

    const { application, balanceCheck } = await applyLeaveService(
        req.body,
        employeeId
    );

    return res.status(201).json({
        success: true,
        message: "Leave application submitted successfully.",
        data: {
            application,
            balanceCheck,
        },
    });
});

export default applyLeaveController;
