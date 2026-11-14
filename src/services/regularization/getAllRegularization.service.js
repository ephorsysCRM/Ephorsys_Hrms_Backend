
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

const getAllRegularizationService = async (query = {}, userRole) => {
    const {
        startDate,
        endDate,
        status,
        employeeId,
        page = "1",
        limit = "20",
    } = query;

    // Normalize logged-in user role
    const role = String(userRole || "").trim().toLowerCase();

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

    // Pagination
    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);

    const pageSize = Math.min(
        100,
        Math.max(1, Number.parseInt(limit, 10) || 20)
    );

    // Build common filters
    const filter = {};

    if (status) {
        filter.status = status;
    }

    if (employeeId) {
        filter.employee = new mongoose.Types.ObjectId(employeeId);
    }

    if (startDate || endDate) {
        filter.attendanceDate = {};

        if (startDate) {
            filter.attendanceDate.$gte = startDate;
        }

        if (endDate) {
            filter.attendanceDate.$lte = endDate;
        }
    }

    // --------------------------------------------------
    // ROLE-BASED FILTERING
    // --------------------------------------------------

    if (role === "hr") {
        const employeeRef =
            Regularization.schema.path("employee")?.options?.ref;

        if (!employeeRef || !mongoose.models[employeeRef]) {
            throw new ApiError(
                500,
                "Employee model is not registered or reference is missing."
            );
        }

        const EmployeeModel = mongoose.model(employeeRef);

        // Find all HR employee IDs
        const hrEmployeeIds = await EmployeeModel.distinct("_id", {
            role: "hr",
        });

        // Exclude HR requests ONLY for HR users
        filter.employee = {
            ...(filter.employee ? { $eq: filter.employee } : {}),
            $nin: hrEmployeeIds,
        };
    }

    // ADMIN: No HR exclusion.
    // Admin can see employee + HR regularization requests.

    // Pagination
    const skip = (pageNumber - 1) * pageSize;

    // Fetch requests and count
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
                    "role",
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
            .sort({
                attendanceDate: -1,
                createdAt: -1,
            })
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
            userRole: role,
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
