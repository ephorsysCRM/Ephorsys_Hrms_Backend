import express from "express";

import adminRouter from "./admin.routes.js";
import departmentRouter from "./department.routes.js"

const router = express.Router();

// ---------------------------------------------
// Admin Routes
// ---------------------------------------------

router.use("/admin", adminRouter);

// ---------------------------------------------
// Department Routes
// ---------------------------------------------

router.use("/department", departmentRouter);

export default router;