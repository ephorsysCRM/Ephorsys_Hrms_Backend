import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
    {
        // =====================================================
        // DEPARTMENT NAME
        // =====================================================

        name: {
            type: String,
            required: [true, "Department name is required"],
            trim: true,
        },

        // =====================================================
        // DEPARTMENT CODE
        // =====================================================

        code: {
            type: String,
            required: [true, "Department code is required"],
            trim: true,
            uppercase: true,
            unique: true,
        },

        // =====================================================
        // DEPARTMENT HEAD
        // =====================================================
        // Initially empty.
        // Will be assigned when an employee is selected
        // as the department head.

        departmentHead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null,
        },

        // =====================================================
        // DESCRIPTION
        // =====================================================

        description: {
            type: String,
            trim: true,
            default: "",
        },

        // =====================================================
        // STATUS
        // =====================================================

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },

        // =====================================================
        // CREATED BY
        // =====================================================
        // Admin/HR who created the department.

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Department = mongoose.model(
    "Department",
    departmentSchema
);

export default Department;