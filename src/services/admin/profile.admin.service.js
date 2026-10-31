import Admin from "../../model/admin.model.js";
import Employee from "../../model/employee.model.js";
import ApiError from "../../utils/ApiError.js";

// =====================================================
// GET AUTHENTICATED USER PROFILE
// Supports Admin, HR, Manager and Employee
// =====================================================

const getAdminProfileService = async (userId, userType) => {
    // =====================================================
    // ADMIN PROFILE
    // =====================================================

    if (userType === "admin") {
        const admin = await Admin.findById(userId).select(
            "-password -refreshToken -__v"
        );

        if (!admin) {
            throw new ApiError(404, "Admin not found");
        }

        if (!admin.isActive || admin.isBlocked) {
            throw new ApiError(403, "Admin account is inactive or blocked");
        }

        return {
            user: admin,
            userType: "admin",
            role: admin.role,
        };
    }

    // =====================================================
    // EMPLOYEE / HR / MANAGER PROFILE
    // =====================================================

    if (userType === "employee") {
        const employee = await Employee.findById(userId).select(
            "-password -refreshToken -bankAccountNumber -bankIFSC -__v"
        );

        if (!employee) {
            throw new ApiError(404, "Employee not found");
        }

        if (employee.employmentStatus !== "active") {
            throw new ApiError(403, "Employee account is inactive");
        }

        return {
            user: employee,
            userType: "employee",
            role: employee.role,
        };
    }

    throw new ApiError(401, "Invalid authenticated user type");
};

export default getAdminProfileService;