import bcrypt from "bcryptjs";

import Admin from "../../model/admin.model.js";
import Employee from "../../model/employee.model.js";
import ApiError from "../../utils/ApiError.js";
import generateToken from "../../utils/generateToken.js";

// =====================================================
// ADMIN / EMPLOYEE LOGIN SERVICE
// =====================================================

const loginAdminService = async (email, password) => {
    // =====================================================
    // 1. VALIDATE INPUT
    // =====================================================

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
        throw new ApiError(
            400,
            "Email and password are required"
        );
    }

    // =====================================================
    // 2. CHECK ADMIN ACCOUNT
    // =====================================================

    const admin = await Admin.findOne({
        email: normalizedEmail,
    }).select("+password");

    if (admin) {
        // Check account status
        if (!admin.isActive) {
            throw new ApiError(
                403,
                "Admin account is inactive"
            );
        }

        if (admin.isBlocked) {
            throw new ApiError(
                403,
                "Admin account is blocked"
            );
        }

        // Verify password
        const isPasswordMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isPasswordMatch) {
            throw new ApiError(
                401,
                "Invalid email or password"
            );
        }

        // Generate Admin JWT
        const token = generateToken({
            _id: admin._id,
            role: admin.role,
            email: admin.email,
            userType: "admin",
        });

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Remove sensitive information
        const adminData = admin.toObject();

        delete adminData.password;

        // Return Admin login response
        return {
            user: adminData,
            userType: "admin",
            role: admin.role,
            token,
        };
    }

    // =====================================================
    // 3. CHECK EMPLOYEE / HR / MANAGER ACCOUNT
    // =====================================================

    const employee = await Employee.findOne({
        officialEmail: normalizedEmail,
    }).select("+password");

    if (!employee) {
        throw new ApiError(
            401,
            "Invalid email or password"
        );
    }

    // Check employee status
    if (employee.employmentStatus !== "active") {
        throw new ApiError(
            403,
            "Employee account is inactive"
        );
    }

    // Verify employee password
    const isPasswordMatch = await bcrypt.compare(
        password,
        employee.password
    );

    if (!isPasswordMatch) {
        throw new ApiError(
            401,
            "Invalid email or password"
        );
    }

    // =====================================================
    // 4. GENERATE EMPLOYEE JWT
    // =====================================================

    const token = generateToken({
        _id: employee._id,
        role: employee.role,
        officialEmail: employee.officialEmail,
        userType: "employee",
    });

    // =====================================================
    // 5. REMOVE SENSITIVE INFORMATION
    // =====================================================

    const employeeData = employee.toObject();

    delete employeeData.password;
    delete employeeData.bankAccountNumber;
    delete employeeData.bankIFSC;

    // =====================================================
    // 6. RETURN EMPLOYEE LOGIN RESPONSE
    // =====================================================

    return {
        user: employeeData,
        userType: "employee",
        role: employee.role,
        token,
    };
};

export default loginAdminService;