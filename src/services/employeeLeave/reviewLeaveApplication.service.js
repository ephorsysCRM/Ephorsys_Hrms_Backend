
import mongoose from "mongoose";

import Employee from "../../model/employee.model.js";
import EmployeeLeave from "../../model/employeeLeave.model.js";
import EmployeeLeaveApplication from "../../model/employeeLeaveApplication.model.js";
import Holiday from "../../model/holiday.model.js";

import ApiError from "../../utils/ApiError.js";

// Convert a date to YYYY-MM-DD using UTC.
const getDateString = (date) => {
    return new Date(date).toISOString().slice(0, 10);
};

// Calculate working days.
// Sundays and active holidays are excluded.
// Saturdays are counted.
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

const reviewLeaveApplicationService = async (
    applicationId,
    payload,
    user
) => {
    const {
        status,
        rejectionReason,
        isUnpaidLeave = false,
    } = payload;

    // ==========================================
    // 1. VALIDATE APPLICATION ID
    // ==========================================

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        throw new ApiError(400, "Invalid leave application ID.");
    }

    // ==========================================
    // 2. VALIDATE REVIEWER
    // ==========================================

    const userRole = user?.role;
    const userId = user?._id;

    if (!["admin", "hr"].includes(userRole)) {
        throw new ApiError(
            403,
            "You are not authorized to review leave applications."
        );
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(401, "Authenticated user not found.");
    }

    // ==========================================
    // 3. VALIDATE STATUS
    // ==========================================

    if (!["approved", "rejected"].includes(status)) {
        throw new ApiError(
            400,
            "Status must be approved or rejected."
        );
    }

    if (status === "rejected") {
        if (
            typeof rejectionReason !== "string" ||
            !rejectionReason.trim()
        ) {
            throw new ApiError(
                400,
                "Rejection reason is required."
            );
        }
    }

    if (status === "approved" && typeof isUnpaidLeave !== "boolean") {
        throw new ApiError(
            400,
            "isUnpaidLeave must be true or false."
        );
    }

    // HR is an Employee model account in this application.
    // Admin is stored in the Admin model.
    const reviewedByType =
        userRole === "admin" ? "Admin" : "Employee";

    // ==========================================
    // 4. START MONGODB TRANSACTION
    // ==========================================

    const session = await mongoose.startSession();

    let reviewedApplicationId;

    try {
        await session.withTransaction(async () => {

            // ==========================================
            // 5. FIND APPLICATION
            // ==========================================

            const application =
                await EmployeeLeaveApplication.findById(applicationId)
                    .session(session);

            if (!application) {
                throw new ApiError(
                    404,
                    "Leave application not found."
                );
            }

            // ==========================================
            // 6. ONLY PENDING APPLICATIONS CAN BE REVIEWED
            // ==========================================

            if (application.status !== "pending") {
                throw new ApiError(
                    409,
                    `This application has already been ${application.status}.`
                );
            }

            // ==========================================
            // 7. HR ACCESS RESTRICTION
            // ==========================================

            if (userRole === "hr") {
                const applicant = await Employee.findById(
                    application.employee
                )
                    .select("role")
                    .session(session);

                if (!applicant) {
                    throw new ApiError(
                        404,
                        "Applicant employee not found."
                    );
                }

                if (["hr", "admin"].includes(applicant.role)) {
                    throw new ApiError(
                        403,
                        "HR can review only regular employee leave applications."
                    );
                }
            }

            // ==========================================
            // 8. APPROVE APPLICATION
            // ==========================================

            if (status === "approved") {

                if (!isUnpaidLeave) {

                    // Fetch active holidays for the application dates.
                    const holidays = await Holiday.find({
                        date: {
                            $gte: application.fromDate,
                            $lte: application.toDate,
                        },
                        isActive: true,
                    })
                        .select("date")
                        .session(session)
                        .lean();

                    const holidayDates = new Set(
                        holidays.map((holiday) =>
                            getDateString(holiday.date)
                        )
                    );

                    // Calculate leave days again using the
                    // same rules as the apply leave service.
                    let yearlyDays;

                    if (application.isHalfDay) {
                        const dateString = getDateString(
                            application.fromDate
                        );

                        const isSunday =
                            new Date(application.fromDate).getUTCDay() === 0;

                        const isHoliday =
                            holidayDates.has(dateString);

                        if (isSunday || isHoliday) {
                            throw new ApiError(
                                400,
                                "Half-day leave cannot be approved on a Sunday or holiday."
                            );
                        }

                        yearlyDays = {
                            [new Date(application.fromDate).getUTCFullYear()]: 0.5,
                        };
                    } else {
                        const calculation = calculateWorkingDays(
                            application.fromDate,
                            application.toDate,
                            holidayDates
                        );

                        yearlyDays = calculation.yearlyDays;

                        if (calculation.totalDays <= 0) {
                            throw new ApiError(
                                400,
                                "No working days found for this application."
                            );
                        }
                    }

                    // ==========================================
                    // 9. CHECK YEARLY LEAVE BALANCES
                    // ==========================================

                    const insufficientBalances = [];

                    for (const [yearString, requiredDays] of Object.entries(yearlyDays)) {
                        const year = Number(yearString);

                        const leaveRecord = await EmployeeLeave.findOne({
                            employee: application.employee,
                            year,
                        })
                            .session(session)
                            .lean();

                        const availableDays =
                            leaveRecord?.[application.leaveType]?.remaining ?? 0;

                        if (availableDays < requiredDays) {
                            insufficientBalances.push({
                                year,
                                requiredDays,
                                availableDays,
                                shortfall: requiredDays - availableDays,
                            });
                        }
                    }

                    if (insufficientBalances.length > 0) {
                        throw new ApiError(
                            409,
                            "Insufficient leave balance. Approve this application as unpaid leave if appropriate.",
                            insufficientBalances
                        );
                    }

                    // ==========================================
                    // 10. DEDUCT YEARLY LEAVE BALANCES
                    // ==========================================

                    for (const [yearString, requiredDays] of Object.entries(yearlyDays)) {
                        const year = Number(yearString);
                        const balancePath =
                            `${application.leaveType}.remaining`;

                        const updateResult = await EmployeeLeave.updateOne(
                            {
                                employee: application.employee,
                                year,
                                [balancePath]: {
                                    $gte: requiredDays,
                                },
                            },
                            {
                                $inc: {
                                    [`${application.leaveType}.used`]: requiredDays,
                                    [balancePath]: -requiredDays,
                                },
                            },
                            {
                                session,
                            }
                        );

                        if (updateResult.modifiedCount !== 1) {
                            throw new ApiError(
                                409,
                                `Leave balance changed or is insufficient for ${year}. Please try again.`
                            );
                        }
                    }
                }

                // For unpaid approval, no paid leave balance
                // is deducted from any year.
                application.isUnpaidLeave = isUnpaidLeave;
                application.status = "approved";
                application.rejectionReason = null;
            }

            // ==========================================
            // 11. REJECT APPLICATION
            // ==========================================

            if (status === "rejected") {
                application.status = "rejected";
                application.rejectionReason = rejectionReason.trim();
                application.isUnpaidLeave = false;
            }

            // ==========================================
            // 12. SAVE REVIEW DETAILS
            // ==========================================

            application.reviewedBy = userId;
            application.reviewedByType = reviewedByType;
            application.reviewedAt = new Date();

            await application.save({ session });

            reviewedApplicationId = application._id;
        });

        // ==========================================
        // 13. FETCH UPDATED APPLICATION
        // ==========================================

        const updatedApplication =
            await EmployeeLeaveApplication.findById(reviewedApplicationId)
                .populate({
                    path: "employee",
                    select: "employeeId firstName middleName lastName profilePhoto department designation",
                })
                .populate({
                    path: "reviewedBy",
                    select: "firstName lastName",
                })
                .lean();

        return {
            application: updatedApplication,
            message:
                status === "approved"
                    ? isUnpaidLeave
                        ? "Leave application approved as unpaid leave."
                        : "Leave application approved and leave balance updated successfully."
                    : "Leave application rejected successfully.",
        };

    } finally {
        await session.endSession();
    }
};

export default reviewLeaveApplicationService;
