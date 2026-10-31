import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";

import validate from "../middlewares/validate.middleware.js";


import createDepartmentValidation from "../validators/department/create.department.validation.js";
import createDepartmentController from "../controllers/department/create.department.controller.js";
import authorizeRoles from "../middlewares/authorize.roles.middleware.js";
import getAllDepartmentController from "../controllers/department/get.all.department.controller.js";
import getDepartmentByIdController from "../controllers/department/get.department.by.id.controller.js";
import updateDepartmentController from "../controllers/department/update.department.controller.js";
import deleteDepartmentController from "../controllers/department/delete.department.controller.js";

const router = express.Router();

// =====================================================
// CREATE DEPARTMENT
// =====================================================
// Allowed:
// super_admin
// admin
// hr
// =====================================================

router.post(
    "/create",
    authMiddleware,
    authorizeRoles(
        "super_admin",
        "admin",
        "hr"
    ),
    validate(createDepartmentValidation),
    createDepartmentController
);

// =====================================================
// Get All  DEPARTMENT
// =====================================================
router.get(
    "/all",
    authMiddleware,
    authorizeRoles(
        "super_admin",
        "admin",
        "hr"
    ),
    getAllDepartmentController
);

// =====================================================
// GET DETAILS DEPARTMENT
// =====================================================
router.get(
    "/:id",
    authMiddleware,
    authorizeRoles(
        "super_admin",
        "admin",
        "hr"
    ),
    getDepartmentByIdController
);

// =====================================================
// UPDATE DEPARTMENT
// =====================================================

router.put(
    "/:id",
    authMiddleware,
    authorizeRoles(
        "super_admin",
        "admin",
        "hr"
    ),
    updateDepartmentController
);

// =====================================================
// DELETE DEPARTMENT
// =====================================================
router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles(
        "super_admin",
        "admin",
        "hr"
    ),
    deleteDepartmentController
);

export default router;