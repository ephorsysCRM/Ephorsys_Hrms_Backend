import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

import errorMiddleware from "./middlewares/error.middleware.js";
import router from "./routers/index.js";

const app = express();

// ---------------------------------------------
// Security Headers
// ---------------------------------------------

app.use(helmet());

// ---------------------------------------------
// Rate Limiting
// ---------------------------------------------

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes
    max: 100,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

app.use("/api", limiter);

// ---------------------------------------------
// CORS Configuration
// ---------------------------------------------

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:4173",
];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

// ---------------------------------------------
// Body Parser
// ---------------------------------------------

app.use(express.json({ limit: "20mb" }));

app.use(
    express.urlencoded({
        extended: true,
        limit: "20mb",
    })
);

// ---------------------------------------------
// Cookie Parser
// ---------------------------------------------

app.use(cookieParser());

// ---------------------------------------------
// Security Middleware
// ---------------------------------------------

app.use(hpp());

// ---------------------------------------------
// Logger
// ---------------------------------------------

app.use(morgan("dev"));

// ---------------------------------------------
// API Routes
// ---------------------------------------------

app.use("/api/v1", router);

// ---------------------------------------------
// Global Error Middleware
// ---------------------------------------------
// IMPORTANT:
// This must always be AFTER all API routes.

app.use(errorMiddleware);

export default app;