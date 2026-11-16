
import asyncHandler from "express-async-handler";

import deleteHolidayService from "../../services/holiday/deleteHoliday.service.js";

const deleteHolidayController = asyncHandler(
    async (req, res) => {
        const holiday = await deleteHolidayService(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "Holiday deleted successfully.",
            data: {
                holiday,
            },
        });
    }
);

export default deleteHolidayController;
