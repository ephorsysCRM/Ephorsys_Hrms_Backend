import express from "express";

import createEmployeeLeaveController from "../controllers/employeeLeave/createEmployeeLeave.controller.js";
import updateEmployeeLeaveController from "../controllers/employeeLeave/updateEmployeeLeave.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorize.roles.middleware.js";
import applyLeaveController from "../controllers/employeeLeave/applyLeave.controller.js";
import getMyLeaveApplicationsController from "../controllers/employeeLeave/getMyLeaveApplications.controller.js";
import getAllLeaveApplicationsController from "../controllers/employeeLeave/getAllLeaveApplications.controller.js";
import reviewLeaveApplicationController from "../controllers/employeeLeave/reviewLeaveApplication.controller.js";

const router = express.Router();

// Create Employee Leave
router.post(
    "/create/:employeeId",
    authMiddleware,
    authorizeRoles("admin", "hr"),
    createEmployeeLeaveController
);

// Update Employee Leave
router.put(
    "/update/:employeeId/:year",
    authMiddleware,
    authorizeRoles("admin", "hr"),
    updateEmployeeLeaveController
);


// Apply Leave 
router.post(
    "/apply",
    authMiddleware,
    authorizeRoles("employee", "hr"),
    applyLeaveController
);

// Get My leave Application List 
router.get(
    "/my-applications",
    authMiddleware,
    authorizeRoles("employee", "hr"),
    getMyLeaveApplicationsController
);


// Get All Leave Applications (Admin + HR)
router.get(
    "/all-applications",
    authMiddleware,
    authorizeRoles("admin", "hr"),
    getAllLeaveApplicationsController
);

// Approve or reject leave application
router.patch(
    "/:applicationId/review",
    authMiddleware,
    authorizeRoles("admin", "hr"),
    reviewLeaveApplicationController
);
export default router;