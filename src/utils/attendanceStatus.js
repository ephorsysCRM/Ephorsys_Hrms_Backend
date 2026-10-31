
const FULL_DAY_MINUTES = 510; // 8 hours 30 minutes

// Calculate completed session duration in minutes.
export const calculateHalfDuration = (half = {}) => {
    const checkInTime = half?.checkIn?.time;
    const checkOutTime = half?.checkOut?.time;

    if (!checkInTime || !checkOutTime) {
        return 0;
    }

    const start = new Date(checkInTime).getTime();
    const end = new Date(checkOutTime).getTime();

    if (
        Number.isNaN(start) ||
        Number.isNaN(end) ||
        end <= start
    ) {
        return 0;
    }

    return Math.floor((end - start) / 60000);
};

// Calculate total work duration and daily attendance status.
export const calculateAttendanceStatus = (attendance) => {
    if (!attendance) {
        return {
            totalWorkDuration: 0,
            status: "pending",
        };
    }

    // Preserve statuses managed by approved requests.
    const protectedStatuses = [
        "leave",
        "holiday",
        "weekly_off",
    ];

    if (protectedStatuses.includes(attendance.status)) {
        return {
            totalWorkDuration: Number(
                attendance.totalWorkDuration || 0
            ),
            status: attendance.status,
        };
    }

    const firstHalf = attendance.firstHalf || {};
    const secondHalf = attendance.secondHalf || {};

    const firstCheckIn = firstHalf?.checkIn?.time;
    const firstCheckOut = firstHalf?.checkOut?.time;

    const secondCheckIn = secondHalf?.checkIn?.time;
    const secondCheckOut = secondHalf?.checkOut?.time;

    const hasOpenSession =
        (Boolean(firstCheckIn) && !firstCheckOut) ||
        (Boolean(secondCheckIn) && !secondCheckOut);

    const firstDuration = calculateHalfDuration(firstHalf);
    const secondDuration = calculateHalfDuration(secondHalf);

    const totalWorkDuration = firstDuration + secondDuration;

    // An active session means checkout is incomplete.
    if (hasOpenSession) {
        return {
            totalWorkDuration,
            status: "pending",
        };
    }

    // No session has started.
    if (!firstCheckIn && !secondCheckIn) {
        return {
            totalWorkDuration,
            status: "pending",
        };
    }

    // 510 minutes or more = full-day attendance.
    if (totalWorkDuration >= FULL_DAY_MINUTES) {
        return {
            totalWorkDuration,
            status: "present",
        };
    }

    // Completed checkouts with less than 510 minutes.
    return {
        totalWorkDuration,
        status: "half_day",
    };
};
