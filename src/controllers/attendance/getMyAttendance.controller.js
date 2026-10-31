
import getMyAttendanceService from "../../services/attendance/getMyAttendance.service.js";

const getMyAttendanceController = async (req, res, next) => {
    try {
        const employeeId = req.employee?._id || req.user?._id;

        if (!employeeId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const result = await getMyAttendanceService(
            employeeId,
            req.query
        );

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

export default getMyAttendanceController;
