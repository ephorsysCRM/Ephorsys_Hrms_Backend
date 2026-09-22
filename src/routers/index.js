import express from "express";

import adminRouter from "./admin.routes.js";

const router = express.Router();

// ---------------------------------------------
// Admin Routes
// ---------------------------------------------

router.use("/admin", adminRouter);

export default router;