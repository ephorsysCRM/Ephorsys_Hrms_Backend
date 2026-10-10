import Department from "../../model/department.model.js";

const getAllDepartmentService = async (page, limit) => {
    // =====================================================
    // PAGINATION
    // =====================================================

    page = Math.max(1, Number(page) || 1);
    limit = Math.max(1, Number(limit) || 10);

    const skip = (page - 1) * limit;

    // =====================================================
    // GET DEPARTMENTS
    // =====================================================

    const departments = await Department.find()

        // =================================================
        // DEPARTMENT HEAD - POPULATE EMPLOYEE DETAILS
        // =================================================

        .populate(
            "departmentHead",
            "employeeId firstName middleName lastName officialEmail role employmentStatus"
        )

        // =================================================
        // CREATED BY
        // =================================================

        .populate(
            "createdBy",
            "name email role"
        )

        // =================================================
        // SORT
        // =================================================

        .sort({
            createdAt: -1,
        })

        // =================================================
        // PAGINATION
        // =================================================

        .skip(skip)
        .limit(limit);

    // =====================================================
    // TOTAL DEPARTMENTS
    // =====================================================

    const totalDepartments =
        await Department.countDocuments();

    // =====================================================
    // TOTAL PAGES
    // =====================================================

    const totalPages = Math.ceil(
        totalDepartments / limit
    );

    // =====================================================
    // RETURN DATA
    // =====================================================

    return {
        departments,

        pagination: {
            currentPage: page,
            limit,
            totalDepartments,
            totalPages,

            hasNextPage: page < totalPages,

            hasPreviousPage: page > 1,
        },
    };
};

export default getAllDepartmentService;