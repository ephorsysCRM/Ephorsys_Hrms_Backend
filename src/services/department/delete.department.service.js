import Department from "../../model/department.model.js";
import Employee from "../../model/employee.model.js";
import ApiError from "../../utils/ApiError.js";

const deleteDepartmentService = async (departmentId) => {
    // =========================================
    // 1. FIND DEPARTMENT
    // =========================================

    const department = await Department.findById(departmentId);

    if (!department) {
        throw new ApiError(404, "Department not found");
    }

    // =========================================
    // 2. CHECK ASSIGNED EMPLOYEES
    // =========================================

    const employeeCount = await Employee.countDocuments({
        department: departmentId,
    });

    // =========================================
    // 3. PREVENT DELETION IF EMPLOYEES EXIST
    // =========================================

    if (employeeCount > 0) {
        throw new ApiError(
            400,
            `Department cannot be deleted because ${employeeCount} employee(s) are assigned to this department.Please reassign them first.`
        );
    }

    // =========================================
    // 4. DELETE DEPARTMENT
    // =========================================

    await Department.findByIdAndDelete(departmentId);

    // =========================================
    // 5. RETURN RESPONSE DATA
    // =========================================

    return {
        departmentId,
        message: "Department deleted successfully",
    };
};

export default deleteDepartmentService;