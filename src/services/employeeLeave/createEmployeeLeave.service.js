
import mongoose from "mongoose";

import Employee from "../../model/employee.model.js";
import EmployeeLeave from "../../model/employeeLeave.model.js";
import ApiError from "../../utils/ApiError.js";

const createEmployeeLeaveService = async (payload, assignedBy) => {
    const {
        employeeId,
        year,
        sickLeave,
        casualLeave,
        workFromHome,
    } = payload;

    // Validate employee ID
    if (!mongoose.isValidObjectId(employeeId)) {
        throw new ApiError(400, "Invalid employee ID.");
    }

    // Check employee existence
    const employee = await Employee.findById(employeeId).select("_id");

    if (!employee) {
        throw new ApiError(404, "Employee not found.");
    }

    // Validate year
    const selectedYear = Number(year);

    if (
        !Number.isInteger(selectedYear) ||
        selectedYear < 2000
    ) {
        throw new ApiError(400, "Please provide a valid leave year.");
    }

    // Validate all three leave balances
    const leaveValues = {
        sickLeave,
        casualLeave,
        workFromHome,
    };

    for (const [key, value] of Object.entries(leaveValues)) {
        if (
            value === undefined ||
            value === null ||
            value === "" ||
            !Number.isFinite(Number(value)) ||
            Number(value) < 0
        ) {
            throw new ApiError(
                400,
                `Please provide a valid ${key} balance.`
            );
        }
    }

    // Check existing leave assignment
    const existingLeave = await EmployeeLeave.findOne({
        employee: employeeId,
        year: selectedYear,
    });

    if (existingLeave) {
        throw new ApiError(
            409,
            "Leave has already been assigned to this employee for this year."
        );
    }

    // Create all three leave balances together
    const leave = await EmployeeLeave.create({
        employee: employeeId,
        year: selectedYear,

        sickLeave: {
            total: Number(sickLeave),
            used: 0,
            remaining: Number(sickLeave),
        },

        casualLeave: {
            total: Number(casualLeave),
            used: 0,
            remaining: Number(casualLeave),
        },

        workFromHome: {
            total: Number(workFromHome),
            used: 0,
            remaining: Number(workFromHome),
        },

        assignedBy,
    });

    return leave;
};

export default createEmployeeLeaveService;
