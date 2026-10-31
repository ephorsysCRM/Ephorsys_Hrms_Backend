import mongoose from "mongoose";
import Attendance from "../../model/attendance.model.js";
import ApiError from "../../utils/ApiError.js";

const getAllAttendanceService = async (query = {}) => {
    const {
        date,
        startDate,
        endDate,
        status,
        employeeId,
        page = 1,
        limit = 20,
    } = query;

    // 1. Validate pagination
    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);

    const pageSize = Math.min(
        100,
        Math.max(1, Number.parseInt(limit, 10) || 20)
    );

    // 2. Validate date format
    const isValidDate = (value) => {
        if (typeof value !== "string") return false;

        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
        }

        const parsed = new Date(`${value}T00:00:00.000Z`);

        return (
            !Number.isNaN(parsed.getTime()) &&
            parsed.toISOString().slice(0, 10) === value
        );
    };

    if (date && (startDate || endDate)) {
        throw new ApiError(
            400,
            "Use either date or startDate/endDate, not both."
        );
    }

    if (date && !isValidDate(date)) {
        throw new ApiError(400, "Invalid date. Use YYYY-MM-DD.");
    }

    if (startDate && !isValidDate(startDate)) {
        throw new ApiError(400, "Invalid startDate. Use YYYY-MM-DD.");
    }

    if (endDate && !isValidDate(endDate)) {
        throw new ApiError(400, "Invalid endDate. Use YYYY-MM-DD.");
    }

    if (startDate && endDate && startDate > endDate) {
        throw new ApiError(
            400,
            "startDate cannot be later than endDate."
        );
    }

    // 3. Build database filters
    const filter = {};

    if (date) {
        filter.date = date;
    } else if (startDate || endDate) {
        filter.date = {};

        if (startDate) filter.date.$gte = startDate;
        if (endDate) filter.date.$lte = endDate;
    }

    // 4. Filter by attendance status
    const allowedStatuses = [
        "pending",
        "present",
        "half_day",
        "absent",
        "leave",
        "holiday",
        "weekly_off",
    ];

    if (status) {
        if (!allowedStatuses.includes(status)) {
            throw new ApiError(400, "Invalid attendance status.");
        }

        filter.status = status;
    }

    // 5. Filter by employee ID
    if (employeeId) {
        if (!mongoose.isValidObjectId(employeeId)) {
            throw new ApiError(400, "Invalid employeeId.");
        }

        filter.employee = employeeId;
    }

    // 6. Fetch attendance records and total count
    const [attendance, totalRecords] = await Promise.all([
        Attendance.find(filter)
            .populate({
                path: "employee",
                select: [
                    "employeeId",
                    "firstName",
                    "middleName",
                    "lastName",
                    "profilePhoto",
                    "department",
                    "designation",
                    "employmentStatus",
                ].join(" "),
                populate: {
                    path: "department",
                    select: "departmentName name",
                },
            })
            .sort({ date: -1, createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean(),

        Attendance.countDocuments(filter),
    ]);

    // 7. Return result
    return {
        attendance,
        pagination: {
            currentPage: pageNumber,
            limit: pageSize,
            totalRecords,
            totalPages: Math.ceil(totalRecords / pageSize),
            hasNextPage: pageNumber * pageSize < totalRecords,
            hasPreviousPage: pageNumber > 1,
        },
    };
};

export default getAllAttendanceService;