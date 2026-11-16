
import mongoose from "mongoose";

import Employee from "../../model/employee.model.js";
import EmployeeLeave from "../../model/employeeLeave.model.js";
import EmployeeLeaveApplication from "../../model/employeeLeaveApplication.model.js";
import Holiday from "../../model/holiday.model.js";

import ApiError from "../../utils/ApiError.js";

// Convert YYYY-MM-DD into a UTC date.
// Strict validation prevents invalid dates such as 2026-02-31.
const parseDate = (value, fieldName) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new ApiError(400, `${fieldName} must be in YYYY-MM-DD format.`);
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
    ) {
        throw new ApiError(400, `Invalid ${fieldName}.`);
    }

    return date;
};

const getDateString = (date) => date.toISOString().slice(0, 10);

// Calculate working days by excluding Sundays and active holidays.
// Saturdays are counted as working days.
const calculateWorkingDays = (fromDate, toDate, holidayDates) => {
    let totalDays = 0;
    const yearlyDays = {};

    const currentDate = new Date(fromDate);

    while (currentDate <= toDate) {
        const dateString = getDateString(currentDate);
        const dayOfWeek = currentDate.getUTCDay();
        const year = currentDate.getUTCFullYear();

        const isSunday = dayOfWeek === 0;
        const isHoliday = holidayDates.has(dateString);

        if (!isSunday && !isHoliday) {
            totalDays += 1;

            yearlyDays[year] = (yearlyDays[year] || 0) + 1;
        }

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return { totalDays, yearlyDays };
};

const applyLeaveService = async (payload, employeeId) => {
    const {
        leaveType,
        fromDate: fromDateInput,
        toDate: toDateInput,
        isHalfDay = false,
        halfDaySession = null,
        reason,
        attachment = null,
    } = payload;

    // 1. Validate authenticated employee ID
    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
        throw new ApiError(400, "Invalid employee ID.");
    }

    // 2. Check employee exists
    const employee = await Employee.findById(employeeId);

    if (!employee) {
        throw new ApiError(404, "Employee not found.");
    }

    // 3. Validate leave type
    const allowedLeaveTypes = [
        "casualLeave",
        "sickLeave",
        "workFromHome",
    ];

    if (!allowedLeaveTypes.includes(leaveType)) {
        throw new ApiError(400, "Invalid leave type.");
    }

    // 4. Validate dates
    const fromDate = parseDate(fromDateInput, "From date");
    const toDate = parseDate(toDateInput, "To date");

    if (toDate < fromDate) {
        throw new ApiError(400, "To date cannot be before from date.");
    }

    // 5. Validate half-day application
    if (typeof isHalfDay !== "boolean") {
        throw new ApiError(400, "isHalfDay must be true or false.");
    }

    if (isHalfDay) {
        if (!["first_half", "second_half"].includes(halfDaySession)) {
            throw new ApiError(
                400,
                "Please select first half or second half."
            );
        }

        if (getDateString(fromDate) !== getDateString(toDate)) {
            throw new ApiError(
                400,
                "Half-day leave must be for a single date."
            );
        }
    } else if (halfDaySession) {
        throw new ApiError(
            400,
            "Half-day session is not allowed for full-day leave."
        );
    }

    // 6. Validate reason
    if (!reason || typeof reason !== "string" || !reason.trim()) {
        throw new ApiError(400, "Leave reason is required.");
    }

    // 7. Find active holidays within the requested date range
    const holidays = await Holiday.find({
        date: {
            $gte: fromDate,
            $lte: toDate,
        },
        isActive: true,
    })
        .select("date")
        .lean();

    const holidayDates = new Set(
        holidays.map((holiday) => getDateString(new Date(holiday.date)))
    );

    // 8. Calculate working days
    let totalDays;
    let yearlyDays;

    if (isHalfDay) {
        const dateString = getDateString(fromDate);
        const isSunday = fromDate.getUTCDay() === 0;
        const isHoliday = holidayDates.has(dateString);

        if (isSunday || isHoliday) {
            throw new ApiError(
                400,
                "Half-day leave cannot be applied on a Sunday or holiday."
            );
        }

        totalDays = 0.5;
        yearlyDays = {
            [fromDate.getUTCFullYear()]: 0.5,
        };
    } else {
        const calculation = calculateWorkingDays(
            fromDate,
            toDate,
            holidayDates
        );

        totalDays = calculation.totalDays;
        yearlyDays = calculation.yearlyDays;
    }

    if (totalDays <= 0) {
        throw new ApiError(
            400,
            "No working days found in the selected leave dates."
        );
    }

    // 9. Check overlapping pending or approved applications
    const overlappingLeave = await EmployeeLeaveApplication.findOne({
        employee: employeeId,
        status: { $in: ["pending", "approved"] },
        fromDate: { $lte: toDate },
        toDate: { $gte: fromDate },
    }).select("_id fromDate toDate status");

    if (overlappingLeave) {
        throw new ApiError(
            409,
            "You already have a pending or approved leave application for overlapping dates."
        );
    }

    // 10. Check yearly leave balance.
    // This is only a warning at application time.
    // Do not deduct balance here.
    const years = Object.keys(yearlyDays).map(Number);

    const leaveBalances = await EmployeeLeave.find({
        employee: employeeId,
        year: { $in: years },
    }).lean();

    const balanceMap = new Map(
        leaveBalances.map((balance) => [balance.year, balance])
    );

    const yearlyBreakdown = [];
    let totalAvailable = 0;
    let isSufficient = true;

    for (const [yearString, requiredDays] of Object.entries(yearlyDays)) {
        const year = Number(yearString);
        const balanceRecord = balanceMap.get(year);

        const availableDays =
            balanceRecord?.[leaveType]?.remaining ?? 0;

        const shortfall = Math.max(0, requiredDays - availableDays);

        if (shortfall > 0) {
            isSufficient = false;
        }

        totalAvailable += availableDays;

        yearlyBreakdown.push({
            year,
            requiredDays,
            availableDays,
            shortfall,
            sufficient: shortfall === 0,
        });
    }

    const balanceCheck = {
        sufficient: isSufficient,
        totalRequired: totalDays,
        totalAvailable,
        shortfall: Math.max(0, totalDays - totalAvailable),
        yearlyBreakdown,
    };

    // 11. Create application with pending status.
    // No leave balance deduction happens here.
    const application = await EmployeeLeaveApplication.create({
        employee: employeeId,
        leaveType,
        fromDate,
        toDate,
        isHalfDay,
        halfDaySession: isHalfDay ? halfDaySession : null,
        totalDays,
        reason: reason.trim(),
        attachment: attachment || null,
        status: "pending",
        isUnpaidLeave: false,
    });

    return {
        application,
        balanceCheck,
    };
};

export default applyLeaveService;
