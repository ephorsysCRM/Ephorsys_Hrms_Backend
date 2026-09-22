import ApiError from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
    // Default values
    let statusCode = 500;
    let message = "Internal Server Error";
    let errors = [];

    // Handle our custom ApiError
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors || [];
    } else {
        // Handle normal JavaScript / Express errors
        message = err.message || message;

        // Mongoose validation error
        if (err.name === "ValidationError") {
            statusCode = 400;

            errors = Object.values(err.errors).map((error) => ({
                field: error.path,
                message: error.message,
            }));
        }

        // Mongoose duplicate key error
        if (err.code === 11000) {
            statusCode = 409;

            const duplicateField = Object.keys(err.keyPattern || {})[0];

            errors = [
                {
                    field: duplicateField,
                    message: `${duplicateField} already exists`,
                },
            ];

            message = `${duplicateField} already exists`;
        }

        // Mongoose CastError
        if (err.name === "CastError") {
            statusCode = 400;
            message = `Invalid ${err.path} `;
        }

        // JWT errors
        if (err.name === "JsonWebTokenError") {
            statusCode = 401;
            message = "Invalid token";
        }

        if (err.name === "TokenExpiredError") {
            statusCode = 401;
            message = "Token has expired";
        }
    }

    // Development logging
    if (process.env.NODE_ENV !== "production") {
        console.error("❌ Error:", err);
    }

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors,
    });
};

export default errorMiddleware;