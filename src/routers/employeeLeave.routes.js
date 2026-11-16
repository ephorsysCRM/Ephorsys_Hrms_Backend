import express from "express";

import createEmployeeLeaveController from "../controllers/employeeLeave/createEmployeeLeave.controller.js";
import updateEmployeeLeaveController from "../controllers/employeeLeave/updateEmployeeLeave.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorize.roles.middleware.js";
import applyLeaveController from "../controllers/employeeLeave/applyLeave.controller.js";
import getMyLeaveApplicationsController from "../controllers/employeeLeave/getMyLeaveApplications.controller.js";

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

export default router;