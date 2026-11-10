
import getAllRegularizationService from "../../services/regularization/getAllRegularization.service.js";

const getAllRegularizationController = async (req, res, next) => {
    try {
        // Get role from authenticated user, not from query parameters.
        const userRole = req.user?.role?.toLowerCase();

        const result = await getAllRegularizationService(
            req.query,
            userRole
        );

        return res.status(200).json({
            success: true,
            message: "Regularization requests fetched successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export default getAllRegularizationController;
