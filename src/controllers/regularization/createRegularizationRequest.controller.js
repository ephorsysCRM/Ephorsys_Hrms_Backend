
import createRegularizationRequestService from "../../services/regularization/createRegularizationRequest.service.js";

const createRegularizationRequestController = async (req, res, next) => {
    try {
        // Get authenticated employee ID
        const employeeId = req.employee?._id || req.user?._id;

        // Create regularization request
        const regularization = await createRegularizationRequestService(
            employeeId,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Regularization request submitted successfully.",
            data: regularization,
        });
    } catch (error) {
        next(error);
    }
};

export default createRegularizationRequestController;
