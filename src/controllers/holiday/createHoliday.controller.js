
import asyncHandler from "express-async-handler";

import createHolidayService from "../../services/holiday/createHoliday.service.js";

const createHolidayController = asyncHandler(
    async (req, res) => {
        const createdBy = req.user?._id;

        if (!createdBy) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user ID not found.",
            });
        }

        const createdByType =
            req.userType === "admin" ? "Admin" : "Employee";

        const holiday = await createHolidayService(
            req.body,
            createdBy,
            createdByType
        );

        return res.status(201).json({
            success: true,
            message: "Holiday created successfully.",
            data: {
                holiday,
            },
        });
    }
);

export default createHolidayController;
