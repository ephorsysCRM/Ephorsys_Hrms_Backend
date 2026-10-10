import Department from "../../model/department.model.js";
import Employee from "../../model/employee.model.js";
import ApiError from "../../utils/ApiError.js";

const getDepartmentByIdService = async (departmentId) => {
    // Find department and populate Department Head
    const department = await Department.findById(departmentId)
        .populate("createdBy", "name email role")
        .populate(
            "departmentHead",
            "firstName middleName lastName employeeId officialEmail role employmentStatus"
        );

    if (!department) {
        throw new ApiError(404, "Department not found");
    }

    // Get employees belonging to this department
    const employees = await Employee.find({
        department: departmentId,
    })
        .select(
            "employeeId firstName middleName lastName officialEmail role employmentStatus"
        )
        .sort({ createdAt: -1 });

    return {
        department,
        totalEmployees: employees.length,
        employees,
    };
};

export default getDepartmentByIdService;