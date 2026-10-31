import bcrypt from "bcrypt";

import Employee from "../../model/employee.model.js";
import Department from "../../model/department.model.js";

import sendEmployeeWelcomeEmailService from "./sendEmployeeWelcomeEmail.service.js";

const createEmployeeService = async (employeeData) => {

    // =====================================================
    // CHECK EMPLOYEE ID
    // =====================================================

    const existingEmployee = await Employee.findOne({
        employeeId: employeeData.employeeId,
    });

    if (existingEmployee) {
        throw new Error("Employee ID already exists");
    }

    // =====================================================
    // CHECK OFFICIAL EMAIL
    // =====================================================

    const officialEmail =
        employeeData.officialEmail?.toLowerCase();

    const existingOfficialEmail = await Employee.findOne({
        officialEmail,
    });

    if (existingOfficialEmail) {
        throw new Error("Official email already exists");
    }

    // =====================================================
    // CHECK DEPARTMENT
    // =====================================================

    const department = await Department.findById(
        employeeData.department
    );

    if (!department) {
        throw new Error("Department not found");
    }

    // =====================================================
    // TEMPORARY PASSWORD
    // Password = Employee Mobile Number
    // =====================================================

    const plainPassword = employeeData.mobile;

    if (!plainPassword) {
        throw new Error("Mobile number is required for password");
    }

    // =====================================================
    // HASH PASSWORD
    // =====================================================

    const hashedPassword = await bcrypt.hash(
        plainPassword,
        10
    );

    // =====================================================
    // PAYROLL VALUES
    // =====================================================

    const basicSalary = Number(
        employeeData.basicSalary || 0
    );

    const hraPercentage = Number(
        employeeData.hraPercentage || 0
    );

    const conveyanceAllowance = Number(
        employeeData.conveyanceAllowance || 0
    );

    const specialAllowance = Number(
        employeeData.specialAllowance || 0
    );

    const epfPercentage = Number(
        employeeData.epfPercentage || 0
    );

    const professionalTaxPercentage = Number(
        employeeData.professionalTaxPercentage || 0
    );

    const tds = Number(
        employeeData.tds || 0
    );

    const employerPfPercentage = Number(
        employeeData.employerPfPercentage || 0
    );

    // =====================================================
    // CALCULATE HRA
    // =====================================================

    const hraAmount =
        (basicSalary * hraPercentage) / 100;

    // =====================================================
    // CALCULATE GROSS SALARY
    // =====================================================

    const grossSalary =
        basicSalary +
        hraAmount +
        conveyanceAllowance +
        specialAllowance;

    // =====================================================
    // EPF
    // =====================================================

    const epfAmount =
        (basicSalary * epfPercentage) / 100;

    // =====================================================
    // PROFESSIONAL TAX
    // =====================================================

    const professionalTaxAmount =
        (grossSalary * professionalTaxPercentage) / 100;

    // =====================================================
    // TOTAL DEDUCTIONS
    // =====================================================

    const totalDeductions =
        epfAmount +
        professionalTaxAmount +
        tds;

    // =====================================================
    // NET SALARY
    // =====================================================

    const netSalary = Math.max(
        grossSalary - totalDeductions,
        0
    );

    // =====================================================
    // EMPLOYER PF
    // =====================================================

    const employerPfAmount =
        (basicSalary * employerPfPercentage) / 100;

    // =====================================================
    // CTC
    // =====================================================

    const ctc =
        grossSalary +
        employerPfAmount;

    // =====================================================
    // CREATE EMPLOYEE
    // =====================================================

    const employee = await Employee.create({
        ...employeeData,

        // =================================================
        // LOGIN DETAILS
        // =================================================

        officialEmail,

        password: hashedPassword,

        // =================================================
        // EMAIL NORMALIZATION
        // =================================================

        personalEmail:
            employeeData.personalEmail?.toLowerCase(),

        // =================================================
        // PAYROLL
        // =================================================

        basicSalary,

        hraPercentage,
        hraAmount,

        conveyanceAllowance,
        specialAllowance,

        grossSalary,

        epfPercentage,
        epfAmount,

        professionalTaxPercentage,
        professionalTaxAmount,

        tds,

        totalDeductions,
        netSalary,

        employerPfPercentage,
        employerPfAmount,

        ctc,
    });

    // =====================================================
    // SEND WELCOME EMAIL
    // =====================================================

    await sendEmployeeWelcomeEmailService({
        employeeName: [
            employee.firstName,
            employee.middleName,
            employee.lastName,
        ]
            .filter(Boolean)
            .join(" "),

        officialEmail: employee.officialEmail,

        password: plainPassword,
    });

    // =====================================================
    // RETURN EMPLOYEE
    // =====================================================

    return employee;
};

export default createEmployeeService;