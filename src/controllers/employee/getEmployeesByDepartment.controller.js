import mongoose from "mongoose";
import Employee from "../../model/employee.model.js";

const getEmployeesByDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID",
            });
        }

        const employees = await Employee.find({
            department: departmentId,
            employmentStatus: "active",
            role: { $in: ["employee", "manager", "hr"] },
        })
            .select("_id employeeId firstName middleName lastName officialEmail")
            .sort({ firstName: 1 });

        return res.status(200).json({
            success: true,
            message: "Department employees fetched successfully",
            total: employees.length,
            employees,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export default getEmployeesByDepartment;