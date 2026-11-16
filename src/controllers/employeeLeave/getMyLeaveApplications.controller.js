
import asyncHandler from "express-async-handler";

import getMyLeaveApplicationsService from "../../services/employeeLeave/getMyLeaveApplications.service.js";

const getMyLeaveApplicationsController = asyncHandler(async (req, res) => {
    // Get authenticated employee ID.
    // Both Employee and HR can view their own applications.
    const employeeId = req.user?._id;

    if (!employeeId) {
        return res.status(401).json({
            success: false,
            message: "Authenticated employee ID not found.",
        });
    }

    const result = await getMyLeaveApplicationsService({
        employeeId,
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
        leaveType: req.query.leaveType,
    });

    return res.status(200).json({
        success: true,
        message: "Leave applications fetched successfully.",
        data: result,
    });
});

export default getMyLeaveApplicationsController;
