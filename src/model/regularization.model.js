
import mongoose from "mongoose";

const regularizationSchema = new mongoose.Schema(
    {
        // Employee submitting the request
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },

        // Attendance date: YYYY-MM-DD
        attendanceDate: {
            type: String,
            required: true,
            trim: true,
        },

        // Employee's reason
        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        // Requested attendance status
        // These values match your Attendance Model
        requestedStatus: {
            type: String,
            enum: ["present", "half_day", "leave"],
            required: true,
        },

        // HR decision status (separate from attendance status)
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },

        // HR who reviewed the request
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null,
        },

        reviewedAt: {
            type: Date,
            default: null,
        },

        // Required when HR rejects
        rejectionReason: {
            type: String,
            trim: true,
            default: "",
            maxlength: 500,
        },
    },
    {
        timestamps: true,
    }
);

// Allow resubmission after rejection.
// Prevent duplicate pending or approved requests.
regularizationSchema.index(
    {
        employee: 1,
        attendanceDate: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            status: {
                $in: ["pending", "approved"],
            },
        },
    }
);

const Regularization = mongoose.model(
    "Regularization",
    regularizationSchema
);

export default Regularization;
