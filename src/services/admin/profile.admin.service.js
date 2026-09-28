import Admin from "../../model/admin.model.js";
import ApiError from "../../utils/ApiError.js";

const getAdminProfileService = async (adminId) => {
    const admin = await Admin.findById(adminId).select(
        "-password -refreshToken -__v"
    );

    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    return admin;
};

export default getAdminProfileService;