
import Employee from "../../model/employee.model.js";
import EmployeeLeave from "../../model/employeeLeave.model.js";

const getEmployeeByIdService = async (employeeId) => {
    // Fetch employee details
    const employee = await Employee.findById(employeeId)
        .populate("department", "name code")
        .select(
            "-password -resetPasswordOTP -resetPasswordOTPExpires"
        )
        .lean();

    if (!employee) {
        throw new Error("Employee not found");
    }

    // Fetch all leave details assigned to this employee
    const leaveDetails = await EmployeeLeave.find({
        employee: employee._id,
    })
        .select("-__v")
        .sort({ year: -1 })
        .lean();

    // Attach leave details to employee profile
    employee.leaveDetails = leaveDetails;

    return employee;
};

export default getEmployeeByIdService;
