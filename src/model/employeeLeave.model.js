
import mongoose from "mongoose";

// Reusable leave balance schema
const leaveBalanceSchema = new mongoose.Schema(
    {
        total: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        used: {
            type: Number,
            default: 0,
            min: 0,
        },

        remaining: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
    },
    {
        _id: false,
    }
);

const employeeLeaveSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },

        year: {
            type: Number,
            required: true,
        },

        sickLeave: {
            type: leaveBalanceSchema,
            required: true,
        },

        casualLeave: {
            type: leaveBalanceSchema,
            required: true,
        },

        workFromHome: {
            type: leaveBalanceSchema,
            required: true,
        },

        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// One leave record per employee per year
employeeLeaveSchema.index(
    { employee: 1, year: 1 },
    { unique: true }
);

const EmployeeLeave = mongoose.model(
    "EmployeeLeave",
    employeeLeaveSchema
);

export default EmployeeLeave;
