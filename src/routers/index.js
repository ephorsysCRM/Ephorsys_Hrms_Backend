import express from "express";

import adminRouter from "./admin.routes.js";
import departmentRouter from "./department.routes.js"
import employeeRouter from "./employee.routes.js"
import attendanceRouter from "./attendance.routes.js"

const router = express.Router();

// ---------------------------------------------
// Admin Routes
// ---------------------------------------------

router.use("/admin", adminRouter);

// ---------------------------------------------
// Department Routes
// ---------------------------------------------

router.use("/department", departmentRouter);

// ---------------------------------------------
// Employee Routes
// ---------------------------------------------

router.use("/employee", employeeRouter);


// ---------------------------------------------
// Attendance Routes
// ---------------------------------------------
router.use("/attendance", attendanceRouter);

export default router;