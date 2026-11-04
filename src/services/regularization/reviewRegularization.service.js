import mongoose from "mongoose";
import Regularization from "../../model/regularization.model.js";
import Attendance from "../../model/attendance.model.js";
import ApiError from "../../utils/ApiError.js";

const reviewRegularizationService = async (
    regularizationId,
    reviewerId,
    payload
) => {
    const { status, rejectionReason } = payload;

    // Validate request ID
    if (!mongoose.isValidObjectId(regularizationId)) {
        throw new ApiError(400, "Invalid regularization request ID.");
    }

    // Validate reviewer
    if (!reviewerId || !mongoose.isValidObjectId(reviewerId)) {
        throw new ApiError(401, "Authenticated reviewer not found.");
    }

    // Only approve or reject is allowed
    if (!["approved", "rejected"].includes(status)) {
        throw new ApiError(
            400,
            "Invalid action. Allowed values: approved, rejected."
        );
    }

    // Rejection reason is mandatory
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

        if (rejectionReason.trim().length > 500) {
            throw new ApiError(
                400,
                "Rejection reason cannot exceed 500 characters."
            );
        }
    }

    // Find the pending request
    const existingRequest = await Regularization.findOne({
        _id: regularizationId,
        status: "pending",
    });

    if (!existingRequest) {
        throw new ApiError(
            404,
            "Pending regularization request not found. It may already have been reviewed."
        );
    }

    // APPROVAL
    if (status === "approved") {
        // Find the employee's attendance for the requested date
        const attendance = await Attendance.findOne({
            employee: existingRequest.employee,
            date: existingRequest.attendanceDate,
        });

        if (!attendance) {
            throw new ApiError(
                404,
                "Attendance record not found for this employee and date. The request cannot be approved."
            );
        }

        const previousStatus = attendance.status;
        const newStatus = existingRequest.requestedStatus;

        // Claim the pending request so it cannot be reviewed twice
        const approvedRequest = await Regularization.findOneAndUpdate(
            {
                _id: regularizationId,
                status: "pending",
            },
            {
                $set: {
                    status: "approved",
                    reviewedBy: reviewerId,
                    reviewedAt: new Date(),
                    rejectionReason: "",
                },
            },
            { new: true }
        );

        if (!approvedRequest) {
            throw new ApiError(
                409,
                "This regularization request has already been reviewed."
            );
        }

        try {
            // Update only the overall attendance status.
            // firstHalf and secondHalf remain unchanged.
            const updatedAttendance = await Attendance.findOneAndUpdate(
                {
                    _id: attendance._id,
                },
                {
                    $set: {
                        status: newStatus,
                    },
                    $push: {
                        statusHistory: {
                            previousStatus,
                            newStatus,
                            reason: `Regularization approved: ${existingRequest.reason}`,
                            updatedBy: reviewerId,
                            updatedAt: new Date(),
                        },
                    },
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

            if (!updatedAttendance) {
                throw new Error("Attendance update failed.");
            }

            return {
                regularization: approvedRequest,
                attendance: updatedAttendance,
            };
        } catch (error) {
            // Restore the request to pending if attendance update fails
            await Regularization.updateOne(
                {
                    _id: regularizationId,
                    status: "approved",
                    reviewedBy: reviewerId,
                },
                {
                    $set: {
                        status: "pending",
                        reviewedBy: null,
                        reviewedAt: null,
                        rejectionReason: "",
                    },
                }
            );

            throw error;
        }
    }

    // REJECTION
    const rejectedRequest = await Regularization.findOneAndUpdate(
        {
            _id: regularizationId,
            status: "pending",
        },
        {
            $set: {
                status: "rejected",
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
                rejectionReason: rejectionReason.trim(),
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!rejectedRequest) {
        throw new ApiError(
            409,
            "This regularization request has already been reviewed."
        );
    }

    return {
        regularization: rejectedRequest,
        attendance: null,
    };
};

export default reviewRegularizationService;