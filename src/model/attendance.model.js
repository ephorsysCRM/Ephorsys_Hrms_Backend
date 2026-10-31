
import mongoose from "mongoose";

// ======================================================
// HALF-DAY ATTENDANCE
// ======================================================

const halfDaySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: [
                "pending",
                "present",
                "half_day",
                "absent",
                "leave",
                "holiday",
                "weekly_off",
                "work_from_home",
            ],
            default: "pending",
            index: true,
        },

        checkIn: {
            time: { type: Date, default: null },
            latitude: { type: Number, default: null },
            longitude: { type: Number, default: null },
            accuracy: { type: Number, default: null },
        },

        checkOut: {
            time: { type: Date, default: null },
            latitude: { type: Number, default: null },
            longitude: { type: Number, default: null },
            accuracy: { type: Number, default: null },
            autoCheckedOut: { type: Boolean, default: false },
        },

        workDuration: {
            type: Number,
            default: 0,
            min: 0,
        },

        request: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AttendanceRequest",
            default: null,
        },
    },
    { _id: false }
);

// ======================================================
// ATTENDANCE
// ======================================================

const attendanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },

        // Local calendar date: YYYY-MM-DD in Asia/Kolkata
        date: {
            type: String,
            required: true,
        },

        firstHalf: {
            type: halfDaySchema,
            default: () => ({}),
        },

        secondHalf: {
            type: halfDaySchema,
            default: () => ({}),
        },

        workMode: {
            type: String,
            enum: ["office", "work_from_home", "mixed"],
            default: "office",
        },

        status: {
            type: String,
            enum: [
                "pending",
                "present",
                "half_day",
                "absent",
                "leave",
                "holiday",
                "weekly_off",
                "work_from_home",
            ],
            default: "pending",
            index: true,
        },

        totalWorkDuration: {
            type: Number,
            default: 0,
            min: 0,
        },

        creditedDuration: {
            type: Number,
            default: 0,
            min: 0,
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },

        // HR/Admin attendance status update history
        statusHistory: [
            {
                previousStatus: {
                    type: String,
                    required: true,
                },

                newStatus: {
                    type: String,
                    required: true,
                },

                reason: {
                    type: String,
                    trim: true,
                    default: "",
                },

                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Employee",
                    required: true,
                },

                updatedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

// One attendance document per employee per local date
attendanceSchema.index(
    { employee: 1, date: 1 },
    { unique: true }
);

const Attendance = mongoose.model(
    "Attendance",
    attendanceSchema
);

export default Attendance;
