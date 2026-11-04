import reviewRegularizationService from "../../services/regularization/reviewRegularization.service.js";

const reviewRegularizationController = async (req, res, next) => {
    try {
        const reviewerId = req.employee?._id || req.user?._id;

        const result = await reviewRegularizationService(
            req.params.regularizationId,
            reviewerId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message:
                req.body.status === "approved"
                    ? "Regularization request approved successfully. Attendance updated."
                    : "Regularization request rejected successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export default reviewRegularizationController;