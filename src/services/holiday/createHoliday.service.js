
import Holiday from "../../model/holiday.model.js";
import ApiError from "../../utils/ApiError.js";

const createHolidayService = async (payload, createdBy, createdByType) => {
    const {
        name,
        date,
        description = "",
    } = payload;

    if (!name || !name.trim()) {
        throw new ApiError(400, "Holiday name is required.");
    }

    // Validate date format: YYYY-MM-DD
    if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        throw new ApiError(
            400,
            "Please provide a valid date in YYYY-MM-DD format."
        );
    }

    // Parse date without timezone shifting
    const [year, month, day] = date.split("-").map(Number);

    const holidayDate = new Date(
        Date.UTC(year, month - 1, day)
    );

    if (
        holidayDate.getUTCFullYear() !== year ||
        holidayDate.getUTCMonth() !== month - 1 ||
        holidayDate.getUTCDate() !== day
    ) {
        throw new ApiError(400, "Invalid holiday date.");
    }

    if (year < 2000) {
        throw new ApiError(400, "Please provide a valid holiday year.");
    }

    if (!["Admin", "Employee"].includes(createdByType)) {
        throw new ApiError(400, "Invalid creator type.");
    }

    // Check duplicate date
    const existingHoliday = await Holiday.findOne({
        date: holidayDate,
    });

    if (existingHoliday) {
        throw new ApiError(
            409,
            "A holiday already exists on this date."
        );
    }

    try {
        const holiday = await Holiday.create({
            name: name.trim(),
            date: holidayDate,
            year,
            description: description.trim(),
            createdBy,
            createdByType,
        });

        return holiday;

    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(
                409,
                "A holiday already exists on this date."
            );
        }

        throw error;
    }
};

export default createHolidayService;
