import asyncHandler from "express-async-handler";

import createAdminService from "../../services/admin/create.admin.service.js";

const createAdminController = asyncHandler(async (req, res) => {
    const admin = await createAdminService(req.body);

    return res.status(201).json({
        success: true,
        statusCode: 201,
        message: "Admin created successfully",
        data: admin,
    });
});

export default createAdminController;