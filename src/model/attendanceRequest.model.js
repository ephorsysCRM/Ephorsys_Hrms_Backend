import mongoose from "mongoose";

const attendanceRequestSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },

        date: {
            type: Date,
            required: true,
            index: true,
        },

        requestType: {
            type: String,
            enum: [
                "half_day",
                "full_day",
                "leave",
                "work_from_home",
                "early_checkout",
                "late_checkin",
                "attendance_adjustment",
            ],
            required: true,
        },

        workMode: {
            type: String,
            enum: ["office", "work_from_home"],
            default: "office",
        },

        dayPart: {
            type: String,
            enum: ["first_half", "second_half", "full_day"],
            required: true,
        },

        startTime: {
            type: Date,
            default: null,
        },

        endTime: {
            type: Date,
            default: null,
        },

        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled"],
            default: "pending",
            index: true,
        },

        requestedAt: {
            type: Date,
            default: Date.now,
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null,
        },

        reviewedAt: {
            type: Date,
            default: null,
        },

        approvalRemarks: {
            type: String,
            trim: true,
            default: "",
        },

        processedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

attendanceRequestSchema.index({ employee: 1, date: 1, status: 1 });

const AttendanceRequest = mongoose.model(
    "AttendanceRequest",
    attendanceRequestSchema
);

export default AttendanceRequest;