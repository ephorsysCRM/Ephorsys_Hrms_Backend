import mongoose from "mongoose";

import Admin from "../../model/admin.model.js";
import Employee from "../../model/employee.model.js";
import ApiError from "../../utils/ApiError.js";

const updateAdminProfileService = async (
    userId,
    updateData
) => {

    // =========================================
    // VALIDATE USER ID
    // =========================================

    if (
        !mongoose.Types.ObjectId.isValid(userId)
    ) {
        throw new ApiError(
            400,
            "Invalid user ID"
        );
    }

    // =========================================
    // FIRST CHECK ADMIN
    // =========================================

    const admin = await Admin.findById(
        userId
    );

    if (admin) {

        // =====================================
        // UPDATE ADMIN NAME
        // =====================================

        if (
            updateData.name !== undefined
        ) {
            admin.name =
                updateData.name;
        }

        // =====================================
        // UPDATE ADMIN PHONE
        // =====================================

        if (
            updateData.phone !== undefined
        ) {
            admin.phone =
                updateData.phone;
        }

        // =====================================
        // UPDATE ADMIN PROFILE IMAGE
        // =====================================

        if (
            updateData.profileImage !==
            undefined
        ) {
            admin.profileImage =
                updateData.profileImage;
        }

        // =====================================
        // SAVE ADMIN
        // =====================================

        await admin.save();

        // =====================================
        // RETURN UPDATED ADMIN
        // =====================================

        const updatedAdmin =
            await Admin.findById(
                userId
            ).select(
                "-password -refreshToken -__v"
            );

        return {
            user: updatedAdmin,
            userType: "admin",
            role: updatedAdmin.role,
        };
    }

    // =========================================
    // IF ADMIN NOT FOUND
    // CHECK EMPLOYEE / HR
    // =========================================

    const employee =
        await Employee.findById(userId);

    if (employee) {

        // =====================================
        // UPDATE EMPLOYEE NAME
        // =====================================

        if (
            updateData.name !== undefined
        ) {

            const nameParts =
                updateData.name
                    .trim()
                    .split(/\s+/);

            employee.firstName =
                nameParts[0] || "";

            employee.lastName =
                nameParts
                    .slice(1)
                    .join(" ") || "";
        }

        // =====================================
        // UPDATE EMPLOYEE PHONE
        // =====================================

        if (
            updateData.phone !== undefined
        ) {
            employee.mobile =
                updateData.phone;
        }

        // =====================================
        // UPDATE EMPLOYEE PROFILE IMAGE
        // =====================================

        if (
            updateData.profileImage !==
            undefined
        ) {
            employee.profilePhoto =
                updateData.profileImage;
        }

        // =====================================
        // SAVE EMPLOYEE
        // =====================================

        await employee.save();

        // =====================================
        // RETURN UPDATED EMPLOYEE
        // =====================================

        const updatedEmployee =
            await Employee.findById(
                userId
            )
                .select("-password")
                .populate(
                    "department",
                    "name code"
                );

        return {
            user: updatedEmployee,
            userType: "employee",
            role: updatedEmployee.role,
        };
    }

    // =========================================
    // USER NOT FOUND
    // =========================================

    throw new ApiError(
        404,
        "User not found"
    );
};

export default updateAdminProfileService;