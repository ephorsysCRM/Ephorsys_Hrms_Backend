import getAllAttendanceService from "../../services/attendance/getAllAttendance.service.js";

const getAllAttendanceController = async (req, res, next) => {
    try {
        const result = await getAllAttendanceService(req.query);

        return res.status(200).json({
            success: true,
            message: "All attendance records fetched successfully.",
            data: result.attendance,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};

export default getAllAttendanceController;