
import mongoose from "mongoose";

import EmployeeLeaveApplication from "../../model/employeeLeaveApplication.model.js";
import ApiError from "../../utils/ApiError.js";

const getMyLeaveApplicationsService = async ({
    employeeId,
    page = 1,
    limit = 10,
    status,
    leaveType,
}) => {
    // 1. Validate employee ID
    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
        throw new ApiError(400, "Invalid employee ID.");
    }

    // 2. Pagination
    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const skip = (currentPage - 1) * perPage;

    // 3. Prepare filter
    const filter = {
        employee: employeeId,
    };

    // 4. Filter by status
    const allowedStatuses = [
        "pending",
        "approved",
        "rejected",
        "cancelled",
    ];

    if (status) {
        if (!allowedStatuses.includes(status)) {
            throw new ApiError(400, "Invalid leave application status.");
        }

        filter.status = status;
    }

    // 5. Filter by leave type
    const allowedLeaveTypes = [
        "casualLeave",
        "sickLeave",
        "workFromHome",
    ];

    if (leaveType) {
        if (!allowedLeaveTypes.includes(leaveType)) {
            throw new ApiError(400, "Invalid leave type.");
        }

        filter.leaveType = leaveType;
    }

    // 6. Fetch applications and total count
    const [applications, totalApplications] = await Promise.all([
        EmployeeLeaveApplication.find(filter)
            .populate("employee", "firstName lastName employeeId email")
            .populate("reviewedBy", "name firstName lastName")
            .select("-__v")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage)
            .lean(),

        EmployeeLeaveApplication.countDocuments(filter),
    ]);

    // 7. Pagination details
    const totalPages = Math.ceil(totalApplications / perPage);

    return {
        applications,
        pagination: {
            currentPage,
            limit: perPage,
            totalApplications,
            totalPages,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1,
        },
    };
};

export default getMyLeaveApplicationsService;
