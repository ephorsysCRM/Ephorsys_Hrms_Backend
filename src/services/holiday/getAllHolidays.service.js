
import Holiday from "../../model/holiday.model.js";
import ApiError from "../../utils/ApiError.js";

const getAllHolidaysService = async ({
    year,
    page = 1,
    limit = 10,
}) => {
    const selectedYear = Number(year);

    if (
        !Number.isInteger(selectedYear) ||
        selectedYear < 2000
    ) {
        throw new ApiError(400, "Please provide a valid holiday year.");
    }

    const currentPage = Math.max(
        Number(page) || 1,
        1
    );

    const perPage = Math.max(
        Number(limit) || 10,
        1
    );

    const skip = (currentPage - 1) * perPage;

    const filter = {
        year: selectedYear,
        isActive: true,
    };

    const [holidays, totalHolidays] = await Promise.all([
        Holiday.find(filter)
            .sort({ date: 1 })
            .skip(skip)
            .limit(perPage)
            .lean(),

        Holiday.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(
        totalHolidays / perPage
    );

    return {
        holidays,

        pagination: {
            currentPage,
            limit: perPage,
            totalHolidays,
            totalPages,

            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1,
        },
    };
};

export default getAllHolidaysService;
