import asyncHandler from "express-async-handler";

import updateAdminProfileService from "../../services/admin/update.admin.profile.service.js";

const updateAdminProfileController = asyncHandler(
    async (req, res) => {

        // =========================================
        // GET ADMIN ID FROM URL
        // =========================================

        const { adminId } = req.params;

        // =========================================
        // UPDATE DATA
        // =========================================

        const updateData = {};

        if (req.body.name !== undefined) {
            updateData.name = req.body.name;
        }

        if (req.body.phone !== undefined) {
            updateData.phone = req.body.phone;
        }

        // =========================================
        // PROFILE IMAGE
        // =========================================

        if (req.file) {
            updateData.profileImage =
                req.file.path;
        }

        // =========================================
        // CALL SERVICE
        // =========================================

        const updatedAdmin =
            await updateAdminProfileService(
                adminId,
                updateData
            );

        // =========================================
        // RESPONSE
        // =========================================

        return res.status(200).json({
            success: true,
            message:
                "Admin profile updated successfully",
            data: updatedAdmin,
        });
    }
);

export default updateAdminProfileController;