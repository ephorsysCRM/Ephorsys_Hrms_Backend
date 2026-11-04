
import mongoose from "mongoose";
import Regularization from "../../model/regularization.model.js";
import ApiError from "../../utils/ApiError.js";

const ALLOWED_STATUSES = ["present", "half_day", "leave"];

const createRegularizationRequestService = async (employeeId, payload) => {
    const {
        attendanceDate,
        reason,
        requestedStatus,
    } = payload;

    // Validate authenticated employee
    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
        throw new ApiError(401, "Authenticated employee not found.");
    }

    // Validate attendance date format
    if (
        typeof attendanceDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)
    ) {
        throw new ApiError(
            400,
            "Attendance date must be in YYYY-MM-DD format."
        );
    }

    // Validate actual calendar date
    const [year, month, day] = attendanceDate.split("-").map(Number);

    const calendarDate = new Date(
        Date.UTC(year, month - 1, day)
    );

    if (
        calendarDate.getUTCFullYear() !== year ||
        calendarDate.getUTCMonth() !== month - 1 ||
        calendarDate.getUTCDate() !== day
    ) {
        throw new ApiError(400, "Please provide a valid attendance date.");
    }

    // Validate requested attendance status
    if (!ALLOWED_STATUSES.includes(requestedStatus)) {
        throw new ApiError(
            400,
            "Invalid requested status. Allowed values: present, half_day, leave."
        );
    }

    // Validate reason
    if (typeof reason !== "string" || !reason.trim()) {
        throw new ApiError(400, "Reason is required.");
    }

    if (reason.trim().length > 500) {
        throw new ApiError(400, "Reason cannot exceed 500 characters.");
    }

    // Prevent duplicate pending or approved requests.
    // Rejected requests can be submitted again.
    const existingRequest = await Regularization.findOne({
        employee: employeeId,
        attendanceDate,
        status: { $in: ["pending", "approved"] },
    });

    if (existingRequest) {
        if (existingRequest.status === "pending") {
            throw new ApiError(
                409,
                "A regularization request is already pending for this date."
            );
        }

        throw new ApiError(
            409,
            "This attendance date has already been regularized and approved."
        );
    }

    // Create regularization request
    const regularization = await Regularization.create({
        employee: employeeId,
        attendanceDate,
        reason: reason.trim(),
        requestedStatus,
        status: "pending",
    });

    return regularization;
};

export default createRegularizationRequestService;
