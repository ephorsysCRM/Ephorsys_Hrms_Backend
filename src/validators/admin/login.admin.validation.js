import Joi from "joi";

const loginAdminValidation = Joi.object({
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
        .required()
        .messages({
            "string.empty": "Password is required",
            "any.required": "Password is required",
        }),
});

export default loginAdminValidation;