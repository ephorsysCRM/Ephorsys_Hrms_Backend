import express from "express";

import createEmployeeController from "../controllers/employee/createEmployee.controller.js";
import employeeUpload from "../middlewares/upload.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorize.roles.middleware.js";

const router = express.Router();

// =====================================================
// CREATE EMPLOYEE
// =====================================================

router.post(
    "/create",

    // 1. Upload files to Cloudinary
    employeeUpload.any(),

    // 2. Check authentication
    authMiddleware,

    // 3. Check allowed roles
    authorizeRoles(
        "super_admin",
        "admin",
        "hr"
    ),

    // 4. Create employee
    createEmployeeController
);

export default router;