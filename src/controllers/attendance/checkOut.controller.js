
import checkOutService from "../../services/attendance/checkOut.service.js";

const checkOutController = async (req, res, next) => {
    try {
        const employeeId = req.employee?._id || req.user?._id;

        if (!employeeId) {
            return res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Authentication required.",
                errors: [],
            });
        }

        // Pass a single object because the service expects an object.
        const result = await checkOutService({
            employeeId: employeeId.toString(),
            ...req.body,
        });

        // Respect the status returned by the service.
        return res.status(result.statusCode || 200).json(result);
    } catch (error) {
        next(error);
    }
};

export default checkOutController;
