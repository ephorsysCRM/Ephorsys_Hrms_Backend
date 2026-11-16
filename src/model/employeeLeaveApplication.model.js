
import mongoose from "mongoose";

const employeeLeaveApplicationSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },

        leaveType: {
            type: String,
            enum: ["casualLeave", "sickLeave", "workFromHome"],
            required: true,
        },

        fromDate: {
            type: Date,
            required: true,
        },

        toDate: {
            type: Date,
            required: true,
        },

        isHalfDay: {
            type: Boolean,
            default: false,
        },

        halfDaySession: {
            type: String,
            enum: ["first_half", "second_half", null],
            default: null,
        },

        totalDays: {
            type: Number,
            required: true,
            min: 0.5,
        },

        reason: {
            type: String,
            required: true,
            trim: true,
        },

        attachment: {
            type: String,
            default: null,
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled"],
            default: "pending",
        },

        // True when HR/Admin approves this application
        // despite insufficient paid leave balance.
        isUnpaidLeave: {
            type: Boolean,
            default: false,
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "reviewedByType",
            default: null,
        },

        reviewedByType: {
            type: String,
            enum: ["Admin", "Employee"],
            default: null,
        },

        reviewedAt: {
            type: Date,
            default: null,
        },

        rejectionReason: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Employee leave history
employeeLeaveApplicationSchema.index({
    employee: 1,
    createdAt: -1,
});

// Date overlap checking
employeeLeaveApplicationSchema.index({
    employee: 1,
    fromDate: 1,
    toDate: 1,
    status: 1,
});

// Validate half-day and date structure
employeeLeaveApplicationSchema.pre("validate", function () {
    if (this.fromDate && this.toDate) {
        if (this.toDate < this.fromDate) {
            this.invalidate("toDate", "To date cannot be before from date.");
        }
    }

    if (this.isHalfDay) {
        if (
            !this.halfDaySession ||
            !["first_half", "second_half"].includes(this.halfDaySession)
        ) {
            this.invalidate(
                "halfDaySession",
                "Please select first half or second half."
            );
        }

        if (
            this.fromDate &&
            this.toDate &&
            this.fromDate.toDateString() !== this.toDate.toDateString()
        ) {
            this.invalidate(
                "toDate",
                "Half-day leave must be for a single date."
            );
        }

        if (this.totalDays !== 0.5) {
            this.invalidate("totalDays", "Half-day leave must be 0.5 days.");
        }
    } else if (this.halfDaySession) {
        this.invalidate(
            "halfDaySession",
            "Half-day session is not allowed for full-day leave."
        );
    }
});

const EmployeeLeaveApplication = mongoose.model(
    "EmployeeLeaveApplication",
    employeeLeaveApplicationSchema
);

export default EmployeeLeaveApplication;
