import Department from "../../model/department.model.js";
import Employee from "../../model/employee.model.js";
import ApiError from "../../utils/ApiError.js";
import mongoose from "mongoose";

const updateDepartmentService = async (departmentId, updateData) => {
    // Find department
    const department = await Department.findById(departmentId);

    if (!department) {
        throw new ApiError(404, "Department not found");
    }

    // Update department name
    if (updateData.name !== undefined) {
        department.name = updateData.name;
    }

    // Update department code
    if (updateData.code !== undefined) {
        department.code = updateData.code.toUpperCase();
    }

    // Update description
    if (updateData.description !== undefined) {
        department.description = updateData.description;
    }

    // Update status
    if (updateData.status !== undefined) {
        department.status = updateData.status;
    }

    // Update Department Head
    if (updateData.departmentHead !== undefined) {
        const headId = updateData.departmentHead;

        if (headId === null || headId === "") {
            department.departmentHead = null;
        } else {
            // Validate employee ID
            if (!mongoose.Types.ObjectId.isValid(headId)) {
                throw new ApiError(400, "Invalid Department Head ID");
            }

            // Check whether employee exists
            const employee = await Employee.findById(headId);

            if (!employee) {
                throw new ApiError(404, "Selected employee not found");
            }

            department.departmentHead = employee._id;
        }
    }

    // Save changes
    await department.save();

    // Return updated department with populated details
    const updatedDepartment = await Department.findById(department._id)
        .populate("createdBy", "name email role")
        .populate(
            "departmentHead",
            "firstName middleName lastName employeeId officialEmail role employmentStatus"
        );

    return updatedDepartment;
};

export default updateDepartmentService;