
import checkInService from "../../services/attendance/checkIn.service.js";

const checkInController = async (req, res, next) => {
    try {
        const employeeId = req.employee?._id || req.user?._id;

        if (!employeeId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const result = await checkInService(employeeId, req.body);

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

export default checkInController;
