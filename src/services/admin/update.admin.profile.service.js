import Admin from "../../model/admin.model.js";
import ApiError from "../../utils/ApiError.js";

const updateAdminProfileService = async (
    adminId,
    updateData
) => {

    // =========================================
    // FIND ADMIN
    // =========================================

    const admin = await Admin.findById(adminId);

    if (!admin) {
        throw new ApiError(
            404,
            "Admin not found"
        );
    }

    // =========================================
    // UPDATE NAME
    // =========================================

    if (updateData.name !== undefined) {
        admin.name = updateData.name;
    }

    // =========================================
    // UPDATE PHONE
    // =========================================

    if (updateData.phone !== undefined) {
        admin.phone = updateData.phone;
    }

    // =========================================
    // UPDATE PROFILE IMAGE
    // =========================================

    if (updateData.profileImage !== undefined) {
        admin.profileImage =
            updateData.profileImage;
    }

    // =========================================
    // SAVE
    // =========================================

    await admin.save();

    // =========================================
    // RETURN UPDATED ADMIN
    // =========================================

    const updatedAdmin = await Admin.findById(
        adminId
    ).select(
        "-password -refreshToken -__v"
    );

    return updatedAdmin;
};

export default updateAdminProfileService;