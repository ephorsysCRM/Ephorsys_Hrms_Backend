import Department from "../../model/department.model.js";
import ApiError from "../../utils/ApiError.js";

const updateDepartmentService = async (
    departmentId,
    updateData
) => {

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
    // UPDATE NAME
    // =====================================================

    if (updateData.name !== undefined) {
        department.name = updateData.name;
    }

    // =====================================================
    // UPDATE CODE
    // =====================================================

    if (updateData.code !== undefined) {
        department.code =
            updateData.code.toUpperCase();
    }

    // =====================================================
    // UPDATE DESCRIPTION
    // =====================================================

    if (updateData.description !== undefined) {
        department.description =
            updateData.description;
    }

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    if (updateData.status !== undefined) {
        department.status =
            updateData.status;
    }

    // =====================================================
    // DEPARTMENT HEAD
    // =====================================================
    // Employee model banne ke baad uncomment karna
    // =====================================================

    /*
    if (updateData.departmentHead !== undefined) {
        department.departmentHead =
            updateData.departmentHead;
    }
    */

    // =====================================================
    // SAVE
    // =====================================================

    await department.save();

    // =====================================================
    // GET UPDATED DEPARTMENT
    // =====================================================

    const updatedDepartment =
        await Department.findById(
            department._id
        ).populate(
            "createdBy",
            "name email role"
        );

    // Employee model banne ke baad:
    /*
    .populate(
        "departmentHead",
        "name email phone profileImage employeeId designation"
    );
    */

    // =====================================================
    // RETURN
    // =====================================================

    return updatedDepartment;
};

export default updateDepartmentService;