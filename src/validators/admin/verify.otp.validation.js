import Joi from "joi";

const verifyOtpValidation = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),

    otp: Joi.string()
        .pattern(/^[0-9]{6}$/)
        .required()
        .messages({
            "string.pattern.base": "OTP must be exactly 6 digits",
            "any.required": "OTP is required",
        }),
});

export default verifyOtpValidation;