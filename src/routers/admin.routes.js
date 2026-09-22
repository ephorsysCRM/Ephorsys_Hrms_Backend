import express from "express";

import createAdminController from "../controllers/admin/create.admin.controller.js";
import loginAdminController from "../controllers/admin/login.admin.controller.js";
import refreshTokenController from "../controllers/admin/refresh.token.controller.js";
import logoutAdminController from "../controllers/admin/logout.admin.controller.js";

import forgotPasswordController from "../controllers/admin/forgot.password.controller.js";
import verifyOtpController from "../controllers/admin/verify.otp.controller.js";
import resetPasswordController from "../controllers/admin/reset.password.controller.js";

import validate from "../middlewares/validate.middleware.js";

import createAdminValidation from "../validators/admin/create.admin.validation.js";
import loginAdminValidation from "../validators/admin/login.admin.validation.js";
import forgotPasswordValidation from "../validators/admin/forgot.password.validation.js";
import verifyOtpValidation from "../validators/admin/verify.otp.validation.js";
import resetPasswordValidation from "../validators/admin/reset.password.validation.js";

const router = express.Router();

// Create Admin
router.post(
    "/create",
    validate(createAdminValidation),
    createAdminController
);

// Login
router.post(
    "/login",
    validate(loginAdminValidation),
    loginAdminController
);

// Refresh Token
router.post(
    "/refresh-token",
    refreshTokenController
);

// Logout
router.post(
    "/logout",
    logoutAdminController
);

// Forgot Password
router.post(
    "/forgot-password",
    validate(forgotPasswordValidation),
    forgotPasswordController
);

// Verify OTP
router.post(
    "/verify-otp",
    validate(verifyOtpValidation),
    verifyOtpController
);

// Reset Password
router.post(
    "/reset-password",
    validate(resetPasswordValidation),
    resetPasswordController
);

export default router;