import Joi from "joi";

const createDepartmentValidation = Joi.object({
    // =====================================================
    // DEPARTMENT NAME
    // =====================================================

    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.base": "Department name must be a string",
            "string.empty": "Department name is required",
            "string.min":
                "Department name must be at least 2 characters",
            "string.max":
                "Department name cannot exceed 100 characters",
            "any.required":
                "Department name is required",
        }),

    // =====================================================
    // DEPARTMENT CODE
    // =====================================================

    code: Joi.string()
        .trim()
        .min(2)
        .max(10)
        .uppercase()
        .required()
        .messages({
            "string.base": "Department code must be a string",
            "string.empty": "Department code is required",
            "string.min":
                "Department code must be at least 2 characters",
            "string.max":
                "Department code cannot exceed 10 characters",
            "any.required":
                "Department code is required",
        }),

    // =====================================================
    // DESCRIPTION
    // =====================================================

    description: Joi.string()
        .trim()
        .max(500)
        .allow("")
        .optional()
        .messages({
            "string.base":
                "Department description must be a string",
            "string.max":
                "Department description cannot exceed 500 characters",
        }),

    // =====================================================
    // STATUS
    // =====================================================

    status: Joi.string()
        .valid("active", "inactive")
        .default("active")
        .messages({
            "any.only":
                "Status must be either active or inactive",
        }),
});

export default createDepartmentValidation;