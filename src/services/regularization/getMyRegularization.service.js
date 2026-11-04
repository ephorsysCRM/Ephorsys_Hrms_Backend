
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

const getMyRegularizationService = async (employeeId, query = {}) => {
    if (!mongoose.isValidObjectId(employeeId)) {
        throw new ApiError(401, "Invalid employee authentication.");
    }

    const {
        startDate,
        endDate,
        status,
        page = "1",
        limit = "10",
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

    // Validate pagination
    const pageNumber = Number(page);
    const pageSize = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        throw new ApiError(400, "page must be a positive integer.");
    }

    if (
        !Number.isInteger(pageSize) ||
        pageSize < 1 ||
        pageSize > 100
    ) {
        throw new ApiError(400, "limit must be between 1 and 100.");
    }

    // Employee can only see their own requests
    const filter = {
        employee: new mongoose.Types.ObjectId(employeeId),
    };

    if (status) {
        filter.status = status;
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
        },
        pagination: {
            currentPage: pageNumber,
            pageSize,
            totalRecords,
            totalPages,
            hasNextPage: pageNumber < totalPages,
            hasPreviousPage: pageNumber > 1,
        },
        requests,
    };
};

export default getMyRegularizationService;
