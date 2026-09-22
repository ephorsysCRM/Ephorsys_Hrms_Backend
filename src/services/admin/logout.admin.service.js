import jwt from "jsonwebtoken";
import Admin from "../../model/admin.model.js";

const logoutAdminService = async (refreshToken) => {
    if (!refreshToken) {
        return;
    }

    try {
        const decodedToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const admin = await Admin.findById(decodedToken.id).select(
            "+refreshToken"
        );

        if (!admin) {
            return;
        }

        admin.refreshToken = null;
        admin.tokenVersion += 1;

        await admin.save();
    } catch (error) {
        // Even if refresh token is expired/invalid,
        // logout should still succeed and clear the cookie.
        return;
    }
};

export default logoutAdminService;