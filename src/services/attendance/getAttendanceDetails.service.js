import mongoose from "mongoose";

import Attendance from "../../model/attendance.model.js";

const getAttendanceDetailsService = async ({ attendanceId }) => {
    try {
        // 1. Validate attendance ID
        if (
            !attendanceId ||
            !mongoose.Types.ObjectId.isValid(attendanceId)
        ) {
            return {
                success: false,
                statusCode: 400,
                message: "Invalid attendance ID.",
            };
        }

        // 2. Fetch attendance with employee, department and history details
        const attendance = await Attendance.findById(attendanceId)
            .populate({
                path: "employee",
                select: [
                    "employeeId",
                    "firstName",
                    "middleName",
                    "lastName",
                    "profilePhoto",
                    "officialEmail",
                    "mobile",
                    "designation",
                    "workLocation",
                    "workMode",
                    "employmentStatus",
                    "joiningDate",
                    "department",
                ].join(" "),
                populate: {
                    path: "department",
                    select: "name",
                },
            })
            .populate({
                path: "statusHistory.updatedBy",
                select: [
                    "employeeId",
                    "firstName",
                    "middleName",
                    "lastName",
                    "profilePhoto",
                    "officialEmail",
                    "designation",
                ].join(" "),
            })
            .lean();

        // 3. Check whether attendance exists
        if (!attendance) {
            return {
                success: false,
                statusCode: 404,
                message: "Attendance record not found.",
            };
        }

        // 4. Check employee reference
        if (!attendance.employee) {
            return {
                success: false,
                statusCode: 404,
                message: "Employee associated with attendance was not found.",
            };
        }

        // 5. Return attendance details
        return {
            success: true,
            statusCode: 200,
            message: "Attendance details fetched successfully.",
            data: {
                _id: attendance._id,
                employee: attendance.employee,
                date: attendance.date,

                status: attendance.status,
                workMode: attendance.workMode,

                firstHalf: attendance.firstHalf,
                secondHalf: attendance.secondHalf,

                totalWorkDuration: attendance.totalWorkDuration,
                creditedDuration: attendance.creditedDuration,

                remarks: attendance.remarks,

                // Attendance status change history with updatedBy populated
                statusHistory: attendance.statusHistory || [],

                createdAt: attendance.createdAt,
                updatedAt: attendance.updatedAt,
            },
        };
    } catch (error) {
        console.error("getAttendanceDetailsService error:", error);

        return {
            success: false,
            statusCode: 500,
            message: "Failed to fetch attendance details.",
        };
    }
};

export default getAttendanceDetailsService;