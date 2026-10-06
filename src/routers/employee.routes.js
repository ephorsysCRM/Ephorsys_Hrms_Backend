import express from "express";

import createEmployeeController from "../controllers/employee/createEmployee.controller.js";
import getAllEmployeeController from "../controllers/employee/getAllEmployee.controller.js";
import getEmployeeByIdController from "../controllers/employee/getEmployeeById.controller.js";

import employeeUpload from "../middlewares/upload.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorize.roles.middleware.js";

const router = express.Router();

// =====================================================
// CREATE EMPLOYEE
// =====================================================

router.post(
    "/create",

    employeeUpload.any(),

    authMiddleware,

    authorizeRoles(
        "super_admin",
        "admin",
        "hr"
    ),

    createEmployeeController
);

// =====================================================
// GET ALL EMPLOYEES
// =====================================================

router.get(
    "/all",

    authMiddleware,

    authorizeRoles(
        "super_admin",
        "admin",
        "hr"
    ),

    getAllEmployeeController
);

// =====================================================
// GET SINGLE EMPLOYEE
// =====================================================

router.get(
    "/:id",

    authMiddleware,

    authorizeRoles(
        "super_admin",
        "admin",
        "hr"
    ),

    getEmployeeByIdController
);

export default router;