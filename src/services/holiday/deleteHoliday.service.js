
import mongoose from "mongoose";

import Holiday from "../../model/holiday.model.js";
import ApiError from "../../utils/ApiError.js";

const deleteHolidayService = async (holidayId) => {
    if (!mongoose.isValidObjectId(holidayId)) {
        throw new ApiError(400, "Invalid holiday ID.");
    }

    const holiday = await Holiday.findById(holidayId);

    if (!holiday || !holiday.isActive) {
        throw new ApiError(404, "Holiday not found.");
    }

    holiday.isActive = false;

    await holiday.save();

    return holiday;
};

export default deleteHolidayService;
