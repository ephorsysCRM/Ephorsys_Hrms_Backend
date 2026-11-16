
import asyncHandler from "express-async-handler";

import updateHolidayService from "../../services/holiday/updateHoliday.service.js";

const updateHolidayController = asyncHandler(
    async (req, res) => {
        const holiday = await updateHolidayService(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Holiday updated successfully.",
            data: {
                holiday,
            },
        });
    }
);

export default updateHolidayController;
