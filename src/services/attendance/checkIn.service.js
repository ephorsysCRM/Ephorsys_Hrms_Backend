
import mongoose from "mongoose";
import Attendance from "../../model/attendance.model.js";
import OfficeLocation from "../../model/officeLocation.model.js";
import ApiError from "../../utils/ApiError.js";

const TIME_ZONE = "Asia/Kolkata";

const OFFICE_START_MINUTES = 10 * 60; // 10:00 AM
const FIRST_HALF_END_MINUTES = 13 * 60 + 30; // 1:30 PM
const SECOND_HALF_START_MINUTES = 14 * 60 + 30; // 2:30 PM
const OFFICE_END_MINUTES = 19 * 60; // 7:00 PM

// Maximum acceptable GPS accuracy in meters.
// A lower value means a more precise location.
const MAX_GPS_ACCURACY_METERS = 150;

// Get current date in Asia/Kolkata timezone.
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

// Get current time in minutes after midnight in India.
const getIndiaMinutes = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.map(({ type, value }) => [type, value])
    );

    return Number(values.hour) * 60 + Number(values.minute);
};

// Calculate distance between two GPS coordinates using Haversine formula.
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const earthRadius = 6371000;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const safeA = Math.min(1, Math.max(0, a));

    return (
        earthRadius *
        2 *
        Math.atan2(Math.sqrt(safeA), Math.sqrt(1 - safeA))
    );
};

const checkInService = async (employeeId, payload = {}) => {
    // 1. Validate employee ID.
    if (!mongoose.isValidObjectId(employeeId)) {
        throw new ApiError(401, "Invalid employee authentication.");
    }

    const {
        latitude,
        longitude,
        accuracy,
        workMode = "office",
    } = payload;

    // 2. Validate GPS coordinates.
    if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        throw new ApiError(
            400,
            "Valid numeric latitude and longitude are required."
        );
    }

    // 3. Validate GPS accuracy when supplied.
    if (
        accuracy !== undefined &&
        (
            typeof accuracy !== "number" ||
            !Number.isFinite(accuracy) ||
            accuracy < 0
        )
    ) {
        throw new ApiError(400, "Invalid GPS accuracy.");
    }

    // 4. Log received GPS data for debugging.
    console.log("Received GPS data:", {
        latitude,
        longitude,
        accuracy,
        accuracyType: typeof accuracy,
        workMode,
    });

    // 5. Reject inaccurate GPS readings.
    if (
        accuracy !== undefined &&
        accuracy > MAX_GPS_ACCURACY_METERS
    ) {
        throw new ApiError(
            400,
            `GPS accuracy is ${accuracy} meters. Maximum allowed accuracy is ${MAX_GPS_ACCURACY_METERS} meters. Please try again in an open area.`
        );
    }

    // 6. This endpoint is only for office check-in.
    if (workMode !== "office") {
        throw new ApiError(
            400,
            "This endpoint only supports office check-in."
        );
    }

    const now = new Date();
    const currentMinutes = getIndiaMinutes(now);

    // 7. Validate office check-in hours.
    if (
        currentMinutes < OFFICE_START_MINUTES ||
        currentMinutes >= OFFICE_END_MINUTES
    ) {
        throw new ApiError(
            400,
            "Office check-in is allowed between 10:00 AM and 7:00 PM IST."
        );
    }

    // 8. Identify the applicable half before creating attendance.
    let halfKey;

    if (currentMinutes < FIRST_HALF_END_MINUTES) {
        halfKey = "firstHalf";
    } else if (currentMinutes >= SECOND_HALF_START_MINUTES) {
        halfKey = "secondHalf";
    } else {
        throw new ApiError(
            400,
            "Check-in is not allowed during lunch break (1:30 PM–2:30 PM)."
        );
    }

    // 9. Fetch active office location.
    const office = await OfficeLocation.findOne({
        isActive: true,
    }).lean();

    if (!office) {
        throw new ApiError(
            500,
            "No active office location is configured."
        );
    }

    // Validate saved office coordinates.
    if (
        !Number.isFinite(office.latitude) ||
        !Number.isFinite(office.longitude) ||
        office.latitude < -90 ||
        office.latitude > 90 ||
        office.longitude < -180 ||
        office.longitude > 180
    ) {
        throw new ApiError(
            500,
            "The configured office location has invalid coordinates."
        );
    }

    // 10. Verify distance from office.
    const distance = getDistanceInMeters(
        latitude,
        longitude,
        office.latitude,
        office.longitude
    );

    const allowedRadius = office.radiusInMeters ?? 100;

    console.log("Office distance verification:", {
        distanceMeters: Math.round(distance),
        allowedRadiusMeters: allowedRadius,
        accuracyMeters: accuracy ?? null,
    });

    if (distance > allowedRadius) {
        throw new ApiError(
            403,
            `You are outside the office check-in radius. Distance: ${Math.round(distance)} meters; allowed radius: ${allowedRadius} meters.`
        );
    }

    // 11. Find today's attendance using India-local date.
    const date = getIndiaDate(now);

    let attendance = await Attendance.findOne({
        employee: employeeId,
        date,
    });

    // 12. Create today's attendance if it doesn't exist.
    if (!attendance) {
        try {
            attendance = await Attendance.create({
                employee: employeeId,
                date,
                workMode: "office",
                status: "pending",
            });
        } catch (error) {
            // Unique index protects against concurrent requests.
            if (error.code === 11000) {
                attendance = await Attendance.findOne({
                    employee: employeeId,
                    date,
                });
            } else {
                throw error;
            }
        }
    }

    if (!attendance) {
        throw new ApiError(
            500,
            "Unable to retrieve or create today's attendance."
        );
    }

    // 13. Ensure the attendance schema supports half-day records.
    const half = attendance[halfKey];

    if (!half) {
        throw new ApiError(
            500,
            "Attendance schema must include firstHalf and secondHalf."
        );
    }

    // 14. Prevent duplicate check-in for this half.
    if (half.checkIn?.time) {
        throw new ApiError(
            409,
            `You have already checked in for the ${halfKey === "firstHalf" ? "first" : "second"
            } half.`
        );
    }

    // 15. Save check-in information.
    half.checkIn = {
        time: now,
        latitude,
        longitude,
        accuracy: accuracy ?? null,
    };

    half.status = "present";
    attendance.workMode = "office";

    // 16. Calculate daily status from both half-day statuses.
    const firstStatus = attendance.firstHalf?.status;
    const secondStatus = attendance.secondHalf?.status;

    if (
        firstStatus === "present" &&
        secondStatus === "present"
    ) {
        attendance.status = "present";
    } else {
        attendance.status = "pending";
    }

    // 17. Save attendance.
    await attendance.save();

    // 18. Return check-in details.
    return {
        message: "Check-in successful.",
        attendance,
        checkInDetails: {
            half: halfKey,
            checkInTime: now,
            office: office.name,
            distanceFromOfficeMeters: Math.round(distance),
            allowedRadiusMeters: allowedRadius,
            gpsAccuracyMeters: accuracy ?? null,
            date,
            timezone: TIME_ZONE,
        },
    };
};

export default checkInService;
