
import Employee from "../../model/employee.model.js";
import EmployeeLeave from "../../model/employeeLeave.model.js";

const getAllEmployeeService = async ({
    page = 1,
    limit = 10,
}) => {
    const currentPage = Math.max(
        Number(page) || 1,
        1
    );

    const perPage = Math.max(
        Number(limit) || 10,
        1
    );

    const skip = (currentPage - 1) * perPage;

    // Fetch employees and total count
    const [employees, totalEmployees] = await Promise.all([
        Employee.find()
            .populate("department", "name code")
            .select(
                "-password -resetPasswordOTP -resetPasswordOTPExpires"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage)
            .lean(),

        Employee.countDocuments(),
    ]);

    // Get employee IDs from current page
    const employeeIds = employees.map(
        (employee) => employee._id
    );

    // Fetch leave records for these employees
    const leaveDetails = await EmployeeLeave.find({
        employee: { $in: employeeIds },
    })
        .select("-__v")
        .sort({ year: -1 })
        .lean();

    // Attach leave details to each employee
    const employeesWithLeaves = employees.map((employee) => {
        const employeeLeaves = leaveDetails.filter(
            (leave) =>
                leave.employee.toString() ===
                employee._id.toString()
        );

        return {
            ...employee,
            leaveDetails: employeeLeaves,
        };
    });

    const totalPages = Math.ceil(
        totalEmployees / perPage
    );

    return {
        employees: employeesWithLeaves,

        pagination: {
            currentPage,
            limit: perPage,
            totalEmployees,
            totalPages,

            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1,
        },
    };
};

export default getAllEmployeeService;
