import Department from "../../model/department.model.js";
import ApiError from "../../utils/ApiError.js";

// Employee model banne ke baad uncomment karna
// import Employee from "../../model/employee.model.js";

const deleteDepartmentService = async (departmentId) => {

    // =====================================================
    // FIND DEPARTMENT
    // =====================================================

    const department = await Department.findById(
        departmentId
    );

    if (!department) {
        throw new ApiError(
            404,
            "Department not found"
        );
    }

    // =====================================================
    // CHECK EMPLOYEES
    // =====================================================
    // Employee model banne ke baad uncomment karna
    // =====================================================

    /*
    const employeeCount =
        await Employee.countDocuments({
            department: departmentId,
        });

    // =====================================================
    // PREVENT DELETE IF EMPLOYEES EXIST
    // =====================================================

    if (employeeCount > 0) {
        throw new ApiError(
            400,
            "Department cannot be deleted because employees are assigned to this department"
        );
    }
    */

    // =====================================================
    // DELETE DEPARTMENT
    // =====================================================

    await Department.findByIdAndDelete(
        departmentId
    );

    // =====================================================
    // RETURN
    // =====================================================

    return {
        departmentId,
    };
};

export default deleteDepartmentService;