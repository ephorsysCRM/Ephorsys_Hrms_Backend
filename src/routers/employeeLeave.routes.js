import express from "express";

import createEmployeeLeaveController from "../controllers/employeeLeave/createEmployeeLeave.controller.js";
import updateEmployeeLeaveController from "../controllers/employeeLeave/updateEmployeeLeave.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorize.roles.middleware.js";

const router = express.Router();

// Create Employee Leave
router.post(
    "/create/:employeeId",
    authMiddleware,
    authorizeRoles("super_admin", "admin", "hr"),
    createEmployeeLeaveController
);

// Update Employee Leave
router.put(
    "/update/:employeeId/:year",
    authMiddleware,
    authorizeRoles("super_admin", "admin", "hr"),
    updateEmployeeLeaveController
);

export default router;