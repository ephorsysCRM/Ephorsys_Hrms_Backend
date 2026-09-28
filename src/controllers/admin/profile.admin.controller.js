import asyncHandler from "express-async-handler";

import getAdminProfileService from "../../services/admin/profile.admin.service.js";

const getAdminProfileController = asyncHandler(async (req, res) => {

    console.log("PROFILE req.admin:", req.admin);

    if (!req.admin) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    const adminId = req.admin._id;

    const admin = await getAdminProfileService(adminId);

    return res.status(200).json({
        success: true,
        message: "Admin profile fetched successfully",
        data: admin,
    });
});

export default getAdminProfileController;