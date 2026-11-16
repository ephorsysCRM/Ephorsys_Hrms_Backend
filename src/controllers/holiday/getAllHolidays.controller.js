
import asyncHandler from "express-async-handler";

import getAllHolidaysService from "../../services/holiday/getAllHolidays.service.js";

const getAllHolidaysController = asyncHandler(
    async (req, res) => {
        const result = await getAllHolidaysService({
            year: req.params.year,
            page: req.query.page,
            limit: req.query.limit,
        });

        return res.status(200).json({
            success: true,
            message: "Holidays fetched successfully.",
            data: result,
        });
    }
);

export default getAllHolidaysController;
