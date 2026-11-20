
import asyncHandler from "express-async-handler";

import getAllLeaveApplicationsService from "../../services/employeeLeave/getAllLeaveApplications.service.js";

const getAllLeaveApplicationsController = asyncHandler(
    async (req, res) => {
        const data = await getAllLeaveApplicationsService(
            req.query,
            req.user
        );

        return res.status(200).json({
            success: true,
            message: "Leave applications fetched successfully.",
            data,
        });
    }
);

export default getAllLeaveApplicationsController;
