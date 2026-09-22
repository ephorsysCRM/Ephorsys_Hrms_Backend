import Joi from "joi";

const resetPasswordValidation = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),

    newPassword: Joi.string()
        .min(6)
        .max(128)
        .required()
        .messages({
            "string.min": "Password must be at least 6 characters",
            "string.max": "Password cannot exceed 128 characters",
            "any.required": "New password is required",
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
            "any.only": "Passwords do not match",
            "any.required": "Confirm password is required",
        }),
});

export default resetPasswordValidation;