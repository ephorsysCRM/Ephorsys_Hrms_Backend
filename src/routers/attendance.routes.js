
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

import checkInController from "../controllers/attendance/checkIn.controller.js";
import checkOutController from "../controllers/attendance/checkOut.controller.js";
import getMyAttendanceController from "../controllers/attendance/getMyAttendance.controller.js";
import getAllAttendanceController from "../controllers/attendance/getAllAttendance.controller.js";
import authorizeRoles from "../middlewares/authorize.roles.middleware.js";
import getAttendanceDetailsController from "../controllers/attendance/getAttendanceDetails.controller.js";
import updateAttendanceStatusController from "../controllers/attendance/updateAttendanceStatus.controller.js";

const router = express.Router();

router.post("/check-in", authMiddleware, checkInController);
router.post("/check-out", authMiddleware, checkOutController);

router.get(
    "/my-attendance",
    authMiddleware,
    getMyAttendanceController
);

// HR attendance dashboard
router.get(
    "/all",
    authMiddleware,
    authorizeRoles(
        "super_admin",
        "admin",
        "hr"
    ),
    getAllAttendanceController
);

// Attendance details by ID
router.get(
    "/details/:attendanceId",
    authMiddleware,
    authorizeRoles("super_admin", "admin", "hr"),
    getAttendanceDetailsController
);

// HR/Admin update attendance status
router.patch(
    "/update-status/:attendanceId",
    authMiddleware,
    authorizeRoles("super_admin", "admin", "hr"),
    updateAttendanceStatusController
);

export default router;
