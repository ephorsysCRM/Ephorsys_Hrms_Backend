import updateAttendanceStatusService from "../../services/attendance/updateAttendanceStatus.service.js";

const updateAttendanceStatusController = async (req, res, next) => {
    try {
        const updatedBy = req.employee?._id || req.user?._id;

        if (!updatedBy) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const result = await updateAttendanceStatusService(
            req.params.attendanceId,
            updatedBy,
            req.body
        );

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

export default updateAttendanceStatusController;