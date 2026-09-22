import Joi from "joi";

const createAdminValidation = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "Admin name is required",
            "string.min": "Admin name must be at least 2 characters",
            "string.max": "Admin name cannot exceed 100 characters",
            "any.required": "Admin name is required",
        }),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required",
        }),

    password: Joi.string()
        .min(6)
        .max(128)
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 6 characters",
            "string.max": "Password cannot exceed 128 characters",
            "any.required": "Password is required",
        }),

    phone: Joi.string()
        .trim()
        .pattern(/^[0-9]{10}$/)
        .allow("", null)
        .messages({
            "string.pattern.base": "Phone number must be exactly 10 digits",
        }),

    profileImage: Joi.string()
        .trim()
        .uri()
        .allow("", null)
        .messages({
            "string.uri": "Profile image must be a valid URL",
        }),

    role: Joi.string()
        .valid("admin", "super_admin")
        .default("admin")
        .messages({
            "any.only": "Role must be either admin or super_admin",
        }),
});

export default createAdminValidation;