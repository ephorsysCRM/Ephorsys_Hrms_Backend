
export const getOpenAttendanceSession = (attendance) => {
    if (!attendance) return null;

    const sessions = ["firstHalf", "secondHalf"];

    for (const halfKey of sessions) {
        const half = attendance[halfKey];

        if (half?.checkIn?.time && !half?.checkOut?.time) {
            return {
                halfKey,
                checkInTime: half.checkIn.time,
                checkInLatitude: half.checkIn.latitude,
                checkInLongitude: half.checkIn.longitude,
            };
        }
    }

    return null;
};
