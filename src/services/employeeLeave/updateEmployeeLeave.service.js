
import mongoose from "mongoose";

import Employee from "../../model/employee.model.js";
import EmployeeLeave from "../../model/employeeLeave.model.js";
import ApiError from "../../utils/ApiError.js";

const updateEmployeeLeaveService = async (
    employeeId,
    year,
    payload
) => {
    // Validate employee ID
    if (!mongoose.isValidObjectId(employeeId)) {
        throw new ApiError(400, "Invalid employee ID.");
    }

    // Validate employee
    const employee = await Employee.findById(employeeId).select("_id");

    if (!employee) {
        throw new ApiError(404, "Employee not found.");
    }

    // Validate year
    const selectedYear = Number(year);

    if (!Number.isInteger(selectedYear) || selectedYear < 2000) {
        throw new ApiError(400, "Invalid leave year.");
    }

    const {
        sickLeave,
        casualLeave,
        workFromHome,
    } = payload;

    // Validate all three balances
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

    // Find existing leave assignment
    const leave = await EmployeeLeave.findOne({
        employee: employeeId,
        year: selectedYear,
    });

    if (!leave) {
        throw new ApiError(
            404,
            "Leave assignment not found for this employee and year."
        );
    }

    // Validate new totals against already-used leaves
    const updates = {
        sickLeave: Number(sickLeave),
        casualLeave: Number(casualLeave),
        workFromHome: Number(workFromHome),
    };

    for (const [key, newTotal] of Object.entries(updates)) {
        if (newTotal < leave[key].used) {
            throw new ApiError(
                400,
                `${key} cannot be less than already used leaves (${leave[key].used}).`
            );
        }
    }

    // Update totals and recalculate remaining leaves.
    // Existing used leaves are preserved.
    for (const [key, newTotal] of Object.entries(updates)) {
        leave[key].total = newTotal;
        leave[key].remaining = newTotal - leave[key].used;
    }

    await leave.save();

    return leave;
};

export default updateEmployeeLeaveService;
