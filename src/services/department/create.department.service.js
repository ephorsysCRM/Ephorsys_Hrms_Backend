import Department from "../../model/department.model.js";
import ApiError from "../../utils/ApiError.js";

const createDepartmentService = async ({
    name,
    code,
    description,
    status,
    createdBy,
}) => {
    // =====================================================
    // CHECK DEPARTMENT CODE
    // =====================================================

    const existingDepartment = await Department.findOne({
        code: code.toUpperCase(),
    });

    if (existingDepartment) {
        throw new ApiError(
            409,
            "Department code already exists"
        );
    }

    // =====================================================
    // CHECK DEPARTMENT NAME
    // =====================================================

    const existingDepartmentName = await Department.findOne({
        name: {
            $regex: `^${name.trim()}$`,
            $options: "i",
        },
    });

    if (existingDepartmentName) {
        throw new ApiError(
            409,
            "Department name already exists"
        );
    }

    // =====================================================
    // CREATE DEPARTMENT
    // =====================================================

    const department = await Department.create({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description?.trim() || "",
        status: status || "active",
        createdBy,
    });

    // =====================================================
    // RETURN DEPARTMENT
    // =====================================================

    return department;
};

export default createDepartmentService;