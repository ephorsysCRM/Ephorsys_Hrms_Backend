import Department from "../../model/department.model.js";
import ApiError from "../../utils/ApiError.js";

// Employee model banne ke baad uncomment karna
// import Employee from "../../model/employee.model.js";

const getDepartmentByIdService = async (departmentId) => {

    // =====================================================
    // FIND DEPARTMENT
    // =====================================================

    const department = await Department.findById(
        departmentId
    )

        // =================================================
        // DEPARTMENT HEAD
        // =================================================
        // Employee model banne ke baad uncomment karna
        // =================================================

        // .populate(
        //     "departmentHead",
        //     "name email phone profileImage employeeId designation"
        // )

        // =================================================
        // CREATED BY
        // =================================================

        .populate(
            "createdBy",
            "name email role"
        );

    // =====================================================
    // CHECK DEPARTMENT
    // =====================================================

    if (!department) {
        throw new ApiError(
            404,
            "Department not found"
        );
    }

    // =====================================================
    // GET ALL EMPLOYEES
    // =====================================================
    // Employee model banne ke baad uncomment karna
    // =====================================================

    /*
    const employees = await Employee.find({
        department: departmentId,
    })
        .select(
            "employeeId name email phone profileImage designation status"
        )
        .sort({
            createdAt: -1,
        });

    const totalEmployees = employees.length;
    */

    // =====================================================
    // TEMPORARY EMPLOYEE DATA
    // =====================================================
    // Employee model banne tak
    // =====================================================

    const employees = [];
    const totalEmployees = 0;

    // =====================================================
    // RETURN
    // =====================================================

    return {
        department,

        totalEmployees,

        employees,
    };
};

export default getDepartmentByIdService;