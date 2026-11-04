import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorize.roles.middleware.js";

// Controllers
import createRegularizationRequestController from "../controllers/regularization/createRegularizationRequest.controller.js";
import getMyRegularizationController from "../controllers/regularization/getMyRegularization.controller.js";
import getAllRegularizationController from "../controllers/regularization/getAllRegularization.controller.js";
import reviewRegularizationController from "../controllers/regularization/reviewRegularization.controller.js";

const router = express.Router();

// Employee submits regularization request
router.post(
    "/request",
    authMiddleware,
    createRegularizationRequestController
);

// Employee views their own requests
router.get(
    "/my-requests",
    authMiddleware,
    getMyRegularizationController
);

// HR/Admin views all requests
router.get(
    "/all",
    authMiddleware,
    authorizeRoles("super_admin", "admin", "hr"),
    getAllRegularizationController
);

// HR/Admin approves or rejects a request
router.patch(
    "/review/:regularizationId",
    authMiddleware,
    authorizeRoles("super_admin", "admin", "hr"),
    reviewRegularizationController
);

export default router;