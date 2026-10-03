import express from "express";

import createAdminController from "../controllers/admin/create.admin.controller.js";
import loginAdminController from "../controllers/admin/login.admin.controller.js";
import logoutAdminController from "../controllers/admin/logout.admin.controller.js";
import forgotPasswordController from "../controllers/admin/forgot.password.controller.js";
import verifyOtpController from "../controllers/admin/verify.otp.controller.js";
import resetPasswordController from "../controllers/admin/reset.password.controller.js";
import getAdminProfileController from "../controllers/admin/profile.admin.controller.js";

import validate from "../middlewares/validate.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";

import createAdminValidation from "../validators/admin/create.admin.validation.js";
import loginAdminValidation from "../validators/admin/login.admin.validation.js";
import forgotPasswordValidation from "../validators/admin/forgot.password.validation.js";
import verifyOtpValidation from "../validators/admin/verify.otp.validation.js";
import resetPasswordValidation from "../validators/admin/reset.password.validation.js";
import updateAdminProfileController from "../controllers/admin/update.admin.profile.controller.js";
import uploadToCloudinary from "../middlewares/upload.middleware.js";

const router = express.Router();

// =====================================================
// CREATE ADMIN
// =====================================================

router.post(
    "/create",
    validate(createAdminValidation),
    createAdminController
);

// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    validate(loginAdminValidation),
    loginAdminController
);

// =====================================================
// PROFILE
// Protected Route
// =====================================================

router.get(
    "/profile",
    authMiddleware,
    getAdminProfileController
);
// =====================================================
// UPDATE
// =====================================================
router.put(
    "/profile/:adminId",
    authMiddleware,
    uploadToCloudinary.single("profileImage"),
    updateAdminProfileController
);

// =====================================================
// LOGOUT
// =====================================================

router.post(
    "/logout",
    authMiddleware,
    logoutAdminController
);

// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post(
    "/forgot-password",
    validate(forgotPasswordValidation),
    forgotPasswordController
);

// =====================================================
// VERIFY OTP
// =====================================================

router.post(
    "/verify-otp",
    validate(verifyOtpValidation),
    verifyOtpController
);

// =====================================================
// RESET PASSWORD
// =====================================================

router.post(
    "/reset-password",
    validate(resetPasswordValidation),
    resetPasswordController
);

export default router;