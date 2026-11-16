
import mongoose from "mongoose";

import Holiday from "../../model/holiday.model.js";
import ApiError from "../../utils/ApiError.js";

const updateHolidayService = async (holidayId, payload) => {
    if (!mongoose.isValidObjectId(holidayId)) {
        throw new ApiError(400, "Invalid holiday ID.");
    }

    const holiday = await Holiday.findById(holidayId);

    if (!holiday || !holiday.isActive) {
        throw new ApiError(404, "Holiday not found.");
    }

    const { name, date, description } = payload;

    if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
            throw new ApiError(400, "Please provide a valid holiday name.");
        }

        holiday.name = name.trim();
    }

    if (date !== undefined) {
        if (
            typeof date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(date)
        ) {
            throw new ApiError(
                400,
                "Please provide a valid date in YYYY-MM-DD format."
            );
        }

        const [year, month, day] = date.split("-").map(Number);

        const holidayDate = new Date(
            Date.UTC(year, month - 1, day)
        );

        if (
            holidayDate.getUTCFullYear() !== year ||
            holidayDate.getUTCMonth() !== month - 1 ||
            holidayDate.getUTCDate() !== day ||
            year < 2000
        ) {
            throw new ApiError(400, "Invalid holiday date.");
        }

        const existingHoliday = await Holiday.findOne({
            date: holidayDate,
            _id: { $ne: holidayId },
        });

        if (existingHoliday) {
            throw new ApiError(
                409,
                "Another holiday already exists on this date."
            );
        }

        holiday.date = holidayDate;
        holiday.year = year;
    }

    if (description !== undefined) {
        if (typeof description !== "string") {
            throw new ApiError(400, "Invalid holiday description.");
        }

        holiday.description = description.trim();
    }

    try {
        await holiday.save();

        return holiday;

    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(
                409,
                "Another holiday already exists on this date."
            );
        }

        throw error;
    }
};

export default updateHolidayService;
