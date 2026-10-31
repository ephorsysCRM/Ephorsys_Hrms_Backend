import asyncHandler from "express-async-handler";

import getAdminProfileService from "../../services/admin/profile.admin.service.js"

// =====================================================
// GET AUTHENTICATED USER PROFILE
// =====================================================

const getAdminProfileController = asyncHandler(async (req, res) => {
    const result = await getAdminProfileService(
        req.user._id,
        req.userType
    );

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Profile fetched successfully",
        data: result,
    });
});

export default getAdminProfileController;