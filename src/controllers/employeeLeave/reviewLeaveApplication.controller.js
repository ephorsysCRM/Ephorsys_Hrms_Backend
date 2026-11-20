
import asyncHandler from "express-async-handler";

import reviewLeaveApplicationService from "../../services/employeeLeave/reviewLeaveApplication.service.js";

const reviewLeaveApplicationController = asyncHandler(
    async (req, res) => {
        const data = await reviewLeaveApplicationService(
            req.params.applicationId,
            req.body,
            req.user
        );

        return res.status(200).json({
            success: true,
            message: data.message,
            data: data.application,
        });
    }
);

export default reviewLeaveApplicationController;
