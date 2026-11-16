
import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorize.roles.middleware.js";

import createHolidayController from "../controllers/holiday/createHoliday.controller.js";
import getAllHolidaysController from "../controllers/holiday/getAllHolidays.controller.js";
import updateHolidayController from "../controllers/holiday/updateHoliday.controller.js";
import deleteHolidayController from "../controllers/holiday/deleteHoliday.controller.js";

const router = express.Router();

// =====================================================
// CREATE HOLIDAY
// Admin / Super Admin
// =====================================================

router.post(
    "/create",
    authMiddleware,
    authorizeRoles("admin", "hr"),
    createHolidayController
);

// =====================================================
// GET HOLIDAYS BY YEAR
// Admin / HR / Employee
// =====================================================

router.get(
    "/year/:year",
    authMiddleware,
    authorizeRoles(
        "admin",
        "hr",
        "employee"
    ),
    getAllHolidaysController
);

// =====================================================
// UPDATE HOLIDAY
// Admin / Super Admin
// =====================================================

router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("admin", "hr"),
    updateHolidayController
);

// =====================================================
// DELETE HOLIDAY
// Admin / Super Admin
// =====================================================

router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("admin", "hr"),
    deleteHolidayController
);

export default router;
