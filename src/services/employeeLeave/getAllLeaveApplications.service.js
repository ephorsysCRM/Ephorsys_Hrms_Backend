import Employee from "../../model/employee.model.js";
import EmployeeLeaveApplication from "../../model/employeeLeaveApplication.model.js";

import ApiError from "../../utils/ApiError.js";

const getAllLeaveApplicationsService = async (
    query,
    user
) => {
    const {
        page = 1,
        limit = 10,
        status,
        leaveType,
    } = query;

    const userRole = user?.role;
    const userId = user?._id;

    // 1. Validate role
    if (!["admin", "hr"].includes(userRole)) {
        throw new ApiError(
            403,
            "You are not authorized to view leave applications."
        );
    }

    if (!userId) {
        throw new ApiError(
            401,
            "Authenticated user not found."
        );
    }

    // 2. Pagination
    const currentPage = Math.max(
        1,
        parseInt(page, 10) || 1
    );

    const pageLimit = Math.min(
        100,
        Math.max(1, parseInt(limit, 10) || 10)
    );

    // 3. Base filter
    const filter = {};

    // 4. HR can see only employee leave requests.
    // HR cannot see their own or any other HR/Admin requests.
    if (userRole === "hr") {
        const restrictedEmployeeIds = await Employee.find({
            role: {
                $in: ["hr", "admin"],
            },
        }).distinct("_id");

        filter.employee = {
            $nin: restrictedEmployeeIds,
        };
    }

    // Admin can see all leave requests.

    // 5. Status filter
    if (status) {
        const allowedStatuses = [
            "pending",
            "approved",
            "rejected",
        ];

        const normalizedStatus = status.toLowerCase();

        if (!allowedStatuses.includes(normalizedStatus)) {
            throw new ApiError(
                400,
                "Invalid leave application status."
            );
        }

        filter.status = normalizedStatus;
    }

    // 6. Leave type filter
    if (leaveType) {
        const allowedLeaveTypes = [
            "casualLeave",
            "sickLeave",
            "workFromHome",
        ];

        if (!allowedLeaveTypes.includes(leaveType)) {
            throw new ApiError(
                400,
                "Invalid leave type."
            );
        }

        filter.leaveType = leaveType;
    }

    // 7. Count applications
    const totalApplications =
        await EmployeeLeaveApplication.countDocuments(filter);

    const totalPages = Math.ceil(
        totalApplications / pageLimit
    );

    // 8. Fetch applications
    const applications =
        await EmployeeLeaveApplication.find(filter)

            // Only required employee details
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
                    "role",
                    "officialEmail",
                ],
            })

            // Only required reviewer details
            .populate({
                path: "reviewedBy",
                select: [
                    "employeeId",
                    "firstName",
                    "lastName",
                    "profilePhoto",
                ],
            })

            .sort({
                createdAt: -1,
            })

            .skip((currentPage - 1) * pageLimit)
            .limit(pageLimit)
            .lean();

    // 9. Return result
    return {
        applications,
        pagination: {
            currentPage,
            limit: pageLimit,
            totalApplications,
            totalPages,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1,
        },
    };
};

export default getAllLeaveApplicationsService;