
import mongoose from "mongoose";
import Regularization from "../../model/regularization.model.js";
import ApiError from "../../utils/ApiError.js";

const isValidDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
};

const getAllRegularizationService = async (query = {}) => {
    const {
        startDate,
        endDate,
        status,
        employeeId,
        page = "1",
        limit = "20",
    } = query;

    // Validate dates
    if (startDate && !isValidDate(startDate)) {
        throw new ApiError(400, "Invalid startDate. Use YYYY-MM-DD.");
    }

    if (endDate && !isValidDate(endDate)) {
        throw new ApiError(400, "Invalid endDate. Use YYYY-MM-DD.");
    }

    if (startDate && endDate && startDate > endDate) {
        throw new ApiError(400, "startDate cannot be later than endDate.");
    }

    // Validate status
    const allowedStatuses = ["pending", "approved", "rejected"];

    if (status && !allowedStatuses.includes(status)) {
        throw new ApiError(400, "Invalid regularization status.");
    }

    // Validate employee ID
    if (employeeId && !mongoose.isValidObjectId(employeeId)) {
        throw new ApiError(400, "Invalid employeeId.");
    }

    // Validate pagination
    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);

    const pageSize = Math.min(
        100,
        Math.max(1, Number.parseInt(limit, 10) || 20)
    );

    // Build filters
    const filter = {};

    if (status) {
        filter.status = status;
    }

    if (employeeId) {
        filter.employee = new mongoose.Types.ObjectId(employeeId);
    }

    if (startDate || endDate) {
        filter.attendanceDate = {};

        if (startDate) filter.attendanceDate.$gte = startDate;
        if (endDate) filter.attendanceDate.$lte = endDate;
    }

    const skip = (pageNumber - 1) * pageSize;

    const [requests, totalRecords] = await Promise.all([
        Regularization.find(filter)
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
            .populate({
                path: "reviewedBy",
                select: "firstName middleName lastName employeeId",
            })
            .sort({ attendanceDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(pageSize)
            .lean(),

        Regularization.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
        filters: {
            startDate: startDate || null,
            endDate: endDate || null,
            status: status || null,
            employeeId: employeeId || null,
        },
        pagination: {
            currentPage: pageNumber,
            limit: pageSize,
            totalRecords,
            totalPages,
            hasNextPage: pageNumber < totalPages,
            hasPreviousPage: pageNumber > 1,
        },
        requests,
    };
};

export default getAllRegularizationService;
