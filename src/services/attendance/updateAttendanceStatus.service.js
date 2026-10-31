import mongoose from "mongoose";
import Attendance from "../../model/attendance.model.js";
import ApiError from "../../utils/ApiError.js";

const TIME_ZONE = "Asia/Kolkata";

const ALLOWED_STATUSES = [
    "pending",
    "present",
    "half_day",
    "absent",
    "leave",
    "holiday",
    "weekly_off",
    "work_from_home",
];

// Get YYYY-MM-DD in Asia/Kolkata.
const getIndiaDate = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.map(({ type, value }) => [type, value])
    );

    return `${values.year}-${values.month}-${values.day}`;
};

// Subtract calendar days from a YYYY-MM-DD date.
const subtractDays = (dateString, days) => {
    const [year, month, day] = dateString.split("-").map(Number);

    // UTC is used only for calendar arithmetic.
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() - days);

    return date.toISOString().slice(0, 10);
};

const updateAttendanceStatusService = async (
    attendanceId,
    updatedBy,
    payload = {}
) => {
    // 1. Validate IDs.
    if (!mongoose.isValidObjectId(attendanceId)) {
        throw new ApiError(400, "Invalid attendance ID.");
    }

    if (!mongoose.isValidObjectId(updatedBy)) {
        throw new ApiError(401, "Invalid user authentication.");
    }

    // 2. Validate request body.
    const { status, reason = "" } = payload;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
        throw new ApiError(
            400,
            `Invalid status. Allowed statuses: ${ALLOWED_STATUSES.join(", ")}.`
        );
    }

    if (typeof reason !== "string") {
        throw new ApiError(400, "Reason must be a string.");
    }

    if (reason.trim().length > 500) {
        throw new ApiError(
            400,
            "Reason cannot exceed 500 characters."
        );
    }

    // 3. Fetch attendance.
    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
        throw new ApiError(404, "Attendance record not found.");
    }

    // 4. Validate attendance date.
    const today = getIndiaDate();
    const yesterday = subtractDays(today, 1);

    // Example:
    // If today is 2026-10-31:
    // 2026-10-31 -> blocked
    // 2026-10-30 -> blocked
    // 2026-10-29 and earlier -> allowed
    if (attendance.date >= yesterday) {
        throw new ApiError(
            403,
            "Attendance can only be updated after one full calendar day has elapsed. Today's and yesterday's attendance cannot be edited."
        );
    }

    // 5. Store previous status.
    const previousStatus = attendance.status;

    // 6. Avoid unnecessary history entries.
    if (previousStatus === status) {
        throw new ApiError(
            400,
            "The attendance already has this status."
        );
    }

    // 7. Update daily attendance status.
    attendance.status = status;

    // Update remarks only when a reason is supplied.
    if (reason.trim()) {
        attendance.remarks = reason.trim();
    }

    // 8. Save audit history.
    attendance.statusHistory.push({
        previousStatus,
        newStatus: status,
        reason: reason.trim(),
        updatedBy,
        updatedAt: new Date(),
    });

    // 9. Save attendance.
    await attendance.save();

    // 10. Return updated record.
    return {
        message: "Attendance status updated successfully.",
        attendance,
    };
};

export default updateAttendanceStatusService;