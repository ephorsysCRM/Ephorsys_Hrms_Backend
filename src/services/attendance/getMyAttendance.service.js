
import mongoose from "mongoose";
import Attendance from "../../model/attendance.model.js";
import ApiError from "../../utils/ApiError.js";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (value) => {
    if (typeof value !== "string" || !DATE_REGEX.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
};

const getMyAttendanceService = async (employeeId, query = {}) => {
    if (!mongoose.isValidObjectId(employeeId)) {
        throw new ApiError(401, "Invalid employee authentication.");
    }

    const {
        startDate,
        endDate,
        page = "1",
        limit = "10",
    } = query;

    // Validate date filters.
    if (startDate && !isValidDate(startDate)) {
        throw new ApiError(
            400,
            "Invalid startDate. Use YYYY-MM-DD format."
        );
    }

    if (endDate && !isValidDate(endDate)) {
        throw new ApiError(
            400,
            "Invalid endDate. Use YYYY-MM-DD format."
        );
    }

    if (startDate && endDate && startDate > endDate) {
        throw new ApiError(
            400,
            "startDate cannot be later than endDate."
        );
    }

    // Validate pagination parameters.
    const pageNumber = Number(page);
    const pageSize = Number(limit);

    if (
        !Number.isInteger(pageNumber) ||
        pageNumber < 1
    ) {
        throw new ApiError(
            400,
            "page must be a positive integer."
        );
    }

    if (
        !Number.isInteger(pageSize) ||
        pageSize < 1 ||
        pageSize > 100
    ) {
        throw new ApiError(
            400,
            "limit must be an integer between 1 and 100."
        );
    }

    // Attendance.date is stored as YYYY-MM-DD.
    const filter = {
        employee: new mongoose.Types.ObjectId(employeeId),
    };

    if (startDate || endDate) {
        filter.date = {};

        if (startDate) {
            filter.date.$gte = startDate;
        }

        if (endDate) {
            filter.date.$lte = endDate;
        }
    }

    const skip = (pageNumber - 1) * pageSize;

    const [records, totalRecords] = await Promise.all([
        Attendance.find(filter)
            .select(
                "employee date firstHalf secondHalf workMode status totalWorkDuration creditedDuration remarks createdAt updatedAt"
            )
            .sort({ date: -1 })
            .skip(skip)
            .limit(pageSize)
            .lean(),

        Attendance.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / pageSize);

    // Build a useful summary for the returned records.
    const summary = records.reduce(
        (result, record) => {
            result.totalWorkDurationMinutes +=
                record.totalWorkDuration ?? 0;

            result.creditedDurationMinutes +=
                record.creditedDuration ?? 0;

            if (record.status === "present") {
                result.presentDays += 1;
            } else if (record.status === "half_day") {
                result.halfDays += 1;
            } else if (record.status === "absent") {
                result.absentDays += 1;
            } else if (record.status === "leave") {
                result.leaveDays += 1;
            } else if (record.status === "holiday") {
                result.holidays += 1;
            } else if (record.status === "weekly_off") {
                result.weeklyOffDays += 1;
            } else if (record.status === "pending") {
                result.pendingDays += 1;
            }

            return result;
        },
        {
            recordsInPage: records.length,
            totalWorkDurationMinutes: 0,
            creditedDurationMinutes: 0,
            presentDays: 0,
            halfDays: 0,
            absentDays: 0,
            leaveDays: 0,
            holidays: 0,
            weeklyOffDays: 0,
            pendingDays: 0,
        }
    );

    return {
        message: "Attendance history fetched successfully.",
        filters: {
            startDate: startDate || null,
            endDate: endDate || null,
            timezone: "Asia/Kolkata",
        },
        summary,
        pagination: {
            currentPage: pageNumber,
            pageSize,
            totalRecords,
            totalPages,
            hasNextPage: pageNumber < totalPages,
            hasPreviousPage: pageNumber > 1,
        },
        attendance: records,
    };
};

export default getMyAttendanceService;
