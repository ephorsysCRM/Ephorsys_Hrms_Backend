import Employee from "../../model/employee.model.js";

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

    const skip =
        (currentPage - 1) * perPage;

    const [employees, totalEmployees] =
        await Promise.all([
            Employee.find()
                .populate(
                    "department",
                    "name code"
                )
                .select(
                    "-password -resetPasswordOTP -resetPasswordOTPExpires"
                )
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(perPage)
                .lean(),

            Employee.countDocuments(),
        ]);

    const totalPages = Math.ceil(
        totalEmployees / perPage
    );

    return {
        employees,

        pagination: {
            currentPage,
            limit: perPage,
            totalEmployees,
            totalPages,

            hasNextPage:
                currentPage < totalPages,

            hasPreviousPage:
                currentPage > 1,
        },
    };
};

export default getAllEmployeeService;