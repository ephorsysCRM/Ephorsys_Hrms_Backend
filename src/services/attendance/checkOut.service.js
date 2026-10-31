
import mongoose from "mongoose";

import Attendance from "../../model/attendance.model.js";
import OfficeLocation from "../../model/officeLocation.model.js";

import {
    calculateAttendanceStatus,
} from "../../utils/attendanceStatus.js";

const OFFICE_START_MINUTES = 600; // 10:00 AM
const LUNCH_START_MINUTES = 810; // 1:30 PM
const LUNCH_END_MINUTES = 870; // 2:30 PM
const OFFICE_END_MINUTES = 1140; // 7:00 PM

const FULL_DAY_MINUTES = 510;
const TIME_ZONE = "Asia/Kolkata";

// Maximum permitted GPS accuracy in meters.
const MAX_GPS_ACCURACY_METERS = 200;

// ======================================================
// DATE AND TIME HELPERS
// ======================================================

// Get current date in Indian timezone.
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

    const hour = Number(
        parts.find((part) => part.type === "hour")?.value
    );

    const minute = Number(
        parts.find((part) => part.type === "minute")?.value
    );

    return hour * 60 + minute;
};

// ======================================================
// GPS DISTANCE
// ======================================================

// Calculate distance between two GPS coordinates.
const calculateDistanceInMeters = (
    latitude1,
    longitude1,
    latitude2,
    longitude2
) => {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const earthRadius = 6371000;

    const latDifference = toRadians(latitude2 - latitude1);
    const lngDifference = toRadians(longitude2 - longitude1);

    const a =
        Math.sin(latDifference / 2) ** 2 +
        Math.cos(toRadians(latitude1)) *
        Math.cos(toRadians(latitude2)) *
        Math.sin(lngDifference / 2) ** 2;

    const safeA = Math.min(1, Math.max(0, a));

    return (
        2 *
        earthRadius *
        Math.atan2(
            Math.sqrt(safeA),
            Math.sqrt(1 - safeA)
        )
    );
};

// ======================================================
// CHECKOUT SERVICE
// ======================================================

const checkOutService = async ({
    employeeId,
    latitude,
    longitude,
    accuracy,
    workMode = "office",
}) => {
    try {
        // 1. Validate employee ID.
        if (
            !employeeId ||
            !mongoose.Types.ObjectId.isValid(employeeId)
        ) {
            return {
                success: false,
                statusCode: 400,
                message: "Invalid employee ID.",
            };
        }

        // 2. Validate GPS coordinates.
        if (
            latitude === undefined ||
            longitude === undefined ||
            latitude === null ||
            longitude === null
        ) {
            return {
                success: false,
                statusCode: 400,
                message: "GPS latitude and longitude are required.",
            };
        }

        const lat = Number(latitude);
        const lng = Number(longitude);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
        ) {
            return {
                success: false,
                statusCode: 400,
                message: "Invalid GPS coordinates.",
            };
        }

        // 3. Validate optional GPS accuracy.
        let gpsAccuracy;

        if (accuracy !== undefined && accuracy !== null) {
            gpsAccuracy = Number(accuracy);

            if (
                !Number.isFinite(gpsAccuracy) ||
                gpsAccuracy < 0
            ) {
                return {
                    success: false,
                    statusCode: 400,
                    message: "Invalid GPS accuracy.",
                };
            }

            console.log("Checkout GPS details:", {
                latitude: lat,
                longitude: lng,
                accuracy: gpsAccuracy,
            });

            if (gpsAccuracy > MAX_GPS_ACCURACY_METERS) {
                return {
                    success: false,
                    statusCode: 400,
                    message:
                        `GPS accuracy is ${gpsAccuracy} meters. ` +
                        `Maximum allowed accuracy is ${MAX_GPS_ACCURACY_METERS} meters. ` +
                        "Please try again in an open area.",
                };
            }
        } else {
            // GPS accuracy is optional in the existing schema.
            console.log("Checkout GPS accuracy was not supplied.");
        }

        // 4. Validate work mode.
        if (workMode !== "office") {
            return {
                success: false,
                statusCode: 400,
                message: "Only office checkout is supported.",
            };
        }

        const now = new Date();
        const currentMinutes = getIndiaMinutes(now);

        // 5. Validate office timings.
        if (
            currentMinutes < OFFICE_START_MINUTES ||
            currentMinutes > OFFICE_END_MINUTES
        ) {
            return {
                success: false,
                statusCode: 400,
                message:
                    "Checkout is allowed between 10:00 AM and 7:00 PM IST.",
            };
        }

        // 6. Prevent checkout during lunch.
        if (
            currentMinutes >= LUNCH_START_MINUTES &&
            currentMinutes < LUNCH_END_MINUTES
        ) {
            return {
                success: false,
                statusCode: 400,
                message:
                    "Checkout is not allowed during the lunch break.",
            };
        }

        // 7. Find active office location.
        const office = await OfficeLocation.findOne({
            isActive: true,
        });

        if (!office) {
            return {
                success: false,
                statusCode: 404,
                message: "No active office location found.",
            };
        }

        const officeLatitude = Number(office.latitude);
        const officeLongitude = Number(office.longitude);
        const allowedRadius = Number(
            office.radiusInMeters ?? 100
        );

        if (
            !Number.isFinite(officeLatitude) ||
            !Number.isFinite(officeLongitude) ||
            officeLatitude < -90 ||
            officeLatitude > 90 ||
            officeLongitude < -180 ||
            officeLongitude > 180 ||
            !Number.isFinite(allowedRadius) ||
            allowedRadius <= 0
        ) {
            return {
                success: false,
                statusCode: 500,
                message: "Office location configuration is invalid.",
            };
        }

        // 8. Check distance from office.
        const distance = calculateDistanceInMeters(
            lat,
            lng,
            officeLatitude,
            officeLongitude
        );

        console.log("Office distance verification:", {
            distanceMeters: Math.round(distance),
            allowedRadiusMeters: allowedRadius,
            accuracyMeters: gpsAccuracy ?? null,
        });

        if (distance > allowedRadius) {
            return {
                success: false,
                statusCode: 403,
                message:
                    `You must be within ${allowedRadius} metres ` +
                    "of the office to check out.",
                data: {
                    distance: Math.round(distance),
                    allowedRadius,
                },
            };
        }

        // 9. Find today's attendance record.
        const today = getIndiaDate(now);

        const attendance = await Attendance.findOne({
            employee: employeeId,
            date: today,
        });

        if (!attendance) {
            return {
                success: false,
                statusCode: 404,
                message: "No attendance check-in found for today.",
            };
        }

        // 10. Identify the active session.
        let halfName;
        let half;

        const firstHalfOpen =
            Boolean(attendance.firstHalf?.checkIn?.time) &&
            !attendance.firstHalf?.checkOut?.time;

        const secondHalfOpen =
            Boolean(attendance.secondHalf?.checkIn?.time) &&
            !attendance.secondHalf?.checkOut?.time;

        if (secondHalfOpen) {
            halfName = "secondHalf";
            half = attendance.secondHalf;
        } else if (firstHalfOpen) {
            halfName = "firstHalf";
            half = attendance.firstHalf;
        }

        if (!half) {
            return {
                success: false,
                statusCode: 400,
                message:
                    "No active check-in found. Please check in before checking out.",
            };
        }

        // 11. Validate check-in time.
        const checkInTime = new Date(half.checkIn.time);

        if (Number.isNaN(checkInTime.getTime())) {
            return {
                success: false,
                statusCode: 400,
                message: "Invalid check-in timestamp.",
            };
        }

        if (now <= checkInTime) {
            return {
                success: false,
                statusCode: 400,
                message: "Checkout must be after check-in.",
            };
        }

        // 12. Calculate current session duration in minutes.
        half.workDuration = Math.floor(
            (now.getTime() - checkInTime.getTime()) / 60000
        );

        // 13. Save checkout time and location.
        half.checkOut.time = now;
        half.checkOut.latitude = lat;
        half.checkOut.longitude = lng;
        half.checkOut.accuracy = gpsAccuracy ?? null;
        half.checkOut.autoCheckedOut = false;

        half.status = "present";
        attendance.workMode = "office";

        // 14. Recalculate daily attendance status.
        const result = calculateAttendanceStatus(attendance);

        attendance.totalWorkDuration = result.totalWorkDuration;
        attendance.status = result.status;

        // 15. Save database changes.
        await attendance.save();

        // 16. Prepare response message.
        let message = "Checkout successful.";

        if (result.status === "present") {
            message =
                "Checkout successful. Full-day attendance marked.";
        } else if (result.status === "half_day") {
            message =
                "Checkout successful. Half-day attendance marked.";
        } else {
            message =
                "Checkout successful. Attendance is pending.";
        }

        // 17. Return checkout details.
        return {
            success: true,
            statusCode: 200,
            message,
            data: {
                attendanceId: attendance._id,
                employee: attendance.employee,
                date: attendance.date,
                checkedOutHalf: halfName,
                checkInTime: half.checkIn.time,
                checkOutTime: half.checkOut.time,
                sessionWorkDuration: half.workDuration,
                totalWorkDuration: attendance.totalWorkDuration,
                requiredWorkDuration: FULL_DAY_MINUTES,
                remainingMinutes: Math.max(
                    0,
                    FULL_DAY_MINUTES - attendance.totalWorkDuration
                ),
                status: attendance.status,
            },
        };
    } catch (error) {
        console.error("checkOutService error:", error);

        return {
            success: false,
            statusCode: 500,
            message: "An error occurred while checking out.",
            error: error.message,
        };
    }
};

export default checkOutService;
