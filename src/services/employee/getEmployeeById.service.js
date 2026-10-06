import Employee from "../../model/employee.model.js";

const getEmployeeByIdService = async (employeeId) => {
    const employee = await Employee.findById(
        employeeId
    )
        .populate(
            "department",
            "name code"
        )
        .select(
            "-password -resetPasswordOTP -resetPasswordOTPExpires"
        )
        .lean();

    if (!employee) {
        throw new Error(
            "Employee not found"
        );
    }

    return employee;
};

export default getEmployeeByIdService;