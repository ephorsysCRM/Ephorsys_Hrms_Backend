import createAttendanceRequestService from "../../services/attendance/createAttendanceRequest.service.js";

const createAttendanceRequestController = async (req, res, next) => {
    try {
        const employeeId = req.employee?._id || req.user?._id;

        const attendanceRequest = await createAttendanceRequestService(
            employeeId,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Attendance request submitted successfully.",
            data: attendanceRequest,
        });
    } catch (error) {
        next(error);
    }
};

export default createAttendanceRequestController;