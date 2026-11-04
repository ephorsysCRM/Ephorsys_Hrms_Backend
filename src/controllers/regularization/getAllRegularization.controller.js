import getAllRegularizationService from "../../services/regularization/getAllRegularization.service.js";

const getAllRegularizationController = async (req, res, next) => {
    try {
        const result = await getAllRegularizationService(req.query);

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