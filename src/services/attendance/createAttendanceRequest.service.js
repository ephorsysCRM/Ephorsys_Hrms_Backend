import mongoose from "mongoose";
import AttendanceRequest from "../../model/attendanceRequest.model.js";
import ApiError from "../../utils/ApiError.js";

const ALLOWED_REQUEST_TYPES = [
    "half_day",
    "full_day",
    "leave",
    "work_from_home",
    "early_checkout",
    "late_checkin",
    "attendance_adjustment",
];

const ALLOWED_DAY_PARTS = ["first_half", "second_half", "full_day"];
const ALLOWED_WORK_MODES = ["office", "work_from_home"];

const createAttendanceRequestService = async (employeeId, payload) => {
    const {
        date,
        requestType,
        dayPart,
        workMode = "office",
        startTime,
        endTime,
        reason,
    } = payload;

    // Validate authenticated employee
    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
        throw new ApiError(401, "Authenticated employee not found.");
    }

    // Validate date format
    if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
        throw new ApiError(400, "Date must be in YYYY-MM-DD format.");
    }

    const [year, month, day] = date.split("-").map(Number);
    const calendarDate = new Date(Date.UTC(year, month - 1, day));

    if (
        calendarDate.getUTCFullYear() !== year ||
        calendarDate.getUTCMonth() !== month - 1 ||
        calendarDate.getUTCDate() !== day
    ) {
        throw new ApiError(400, "Please provide a valid date.");
    }

    // Validate request fields
    if (!ALLOWED_REQUEST_TYPES.includes(requestType)) {
        throw new ApiError(400, "Invalid attendance request type.");
    }

    if (!ALLOWED_DAY_PARTS.includes(dayPart)) {
        throw new ApiError(400, "Invalid dayPart.");
    }

    if (!ALLOWED_WORK_MODES.includes(workMode)) {
        throw new ApiError(400, "Invalid workMode.");
    }

    if (typeof reason !== "string" || !reason.trim()) {
        throw new ApiError(400, "Reason is required.");
    }

    if (reason.trim().length > 1000) {
        throw new ApiError(400, "Reason cannot exceed 1000 characters.");
    }

    if (requestType === "half_day" && dayPart === "full_day") {
        throw new ApiError(400, "Half-day request must specify a half-day part.");
    }

    if (
        ["full_day", "leave"].includes(requestType) &&
        dayPart !== "full_day"
    ) {
        throw new ApiError(400, `${requestType} request must use full_day.`);
    }

    // Parse optional time values.
    // Accepts ISO date-time strings or HH:mm in office local time (IST).
    const parseRequestTime = (value, fieldName) => {
        if (value === undefined || value === null || value === "") return null;

        if (typeof value !== "string") {
            throw new ApiError(400, `${fieldName} must be a time string.`);
        }

        let parsedTime;

        if (/^\d{2}:\d{2}$/.test(value)) {
            const [hours, minutes] = value.split(":").map(Number);

            if (hours > 23 || minutes > 59) {
                throw new ApiError(400, `Invalid ${fieldName}.`);
            }

            // Interpret HH:mm as IST on the requested date.
            parsedTime = new Date(
                `${date}T${value}:00+05:30`
            );
        } else {
            parsedTime = new Date(value);
        }

        if (Number.isNaN(parsedTime.getTime())) {
            throw new ApiError(400, `Invalid ${fieldName}.`);
        }

        return parsedTime;
    };

    const parsedStartTime = parseRequestTime(startTime, "startTime");
    const parsedEndTime = parseRequestTime(endTime, "endTime");

    if (
        parsedStartTime &&
        parsedEndTime &&
        parsedEndTime <= parsedStartTime
    ) {
        throw new ApiError(400, "endTime must be later than startTime.");
    }

    if (
        ["early_checkout", "late_checkin"].includes(requestType) &&
        !parsedStartTime &&
        !parsedEndTime
    ) {
        throw new ApiError(
            400,
            "Provide startTime or endTime for this request."
        );
    }

    // Prevent duplicate pending requests for the same date/type/day part.
    const existingRequest = await AttendanceRequest.findOne({
        employee: employeeId,
        date: calendarDate,
        requestType,
        dayPart,
        status: "pending",
    });

    if (existingRequest) {
        throw new ApiError(
            409,
            "A pending request of this type already exists for this date and day part."
        );
    }

    const attendanceRequest = await AttendanceRequest.create({
        employee: employeeId,
        date: calendarDate,
        requestType,
        dayPart,
        workMode,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        reason: reason.trim(),
        status: "pending",
        requestedAt: new Date(),
    });

    return attendanceRequest;
};

export default createAttendanceRequestService;