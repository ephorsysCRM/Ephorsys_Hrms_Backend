import getAttendanceDetailsService from "../../services/attendance/getAttendanceDetails.service.js";

const getAttendanceDetailsController = async (req, res) => {
    try {
        const result = await getAttendanceDetailsService({
            attendanceId: req.params.attendanceId,
        });

        return res.status(result.statusCode).json(result);
    } catch (error) {
        console.error("getAttendanceDetailsController error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

export default getAttendanceDetailsController;