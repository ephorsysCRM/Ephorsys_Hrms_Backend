import getMyRegularizationService from "../../services/regularization/getMyRegularization.service.js";

const getMyRegularizationController = async (req, res, next) => {
    try {
        const employeeId = req.employee?._id || req.user?._id;

        const result = await getMyRegularizationService(
            employeeId,
            req.query
        );

        return res.status(200).json({
            success: true,
            message: "My regularization requests fetched successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export default getMyRegularizationController;