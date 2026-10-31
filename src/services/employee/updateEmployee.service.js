import mongoose from "mongoose";

import ApiError from "../../utils/ApiError.js";
import Employee from "../../model/employee.model.js";
import Department from "../../model/department.model.js";

const updateEmployeeService = async (
    employeeId,
    employeeData,
    files = []
) => {

    // =====================================================
    // VALIDATE EMPLOYEE ID
    // =====================================================

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        throw new ApiError(
            400,
            "Invalid employee ID"
        );
    }

    // =====================================================
    // FIND EMPLOYEE
    // =====================================================

    const employee = await Employee.findById(employeeId);

    if (!employee) {
        throw new ApiError(
            404,
            "Employee not found"
        );
    }

    // =====================================================
    // PARSE EDUCATION LIST
    // =====================================================

    let educationList = employeeData.educationList;

    if (typeof educationList === "string") {
        try {
            educationList = JSON.parse(
                educationList
            );
        } catch {
            throw new ApiError(
                400,
                "Invalid educationList format"
            );
        }
    }

    // =====================================================
    // PARSE EXPERIENCE LIST
    // =====================================================

    let experienceList = employeeData.experienceList;

    if (typeof experienceList === "string") {
        try {
            experienceList = JSON.parse(
                experienceList
            );
        } catch {
            throw new ApiError(
                400,
                "Invalid experienceList format"
            );
        }
    }

    // =====================================================
    // OFFICIAL EMAIL DUPLICATE CHECK
    // =====================================================

    const officialEmail =
        employeeData.officialEmail
            ?.trim()
            .toLowerCase();

    if (
        officialEmail &&
        officialEmail !== employee.officialEmail
    ) {

        const existingEmployee =
            await Employee.findOne({
                officialEmail,
                _id: {
                    $ne: employeeId,
                },
            });

        if (existingEmployee) {
            throw new ApiError(
                409,
                "Official email already exists"
            );
        }
    }

    // =====================================================
    // EMPLOYEE ID DUPLICATE CHECK
    // =====================================================

    if (
        employeeData.employeeId &&
        employeeData.employeeId !== employee.employeeId
    ) {

        const existingEmployee =
            await Employee.findOne({
                employeeId:
                    employeeData.employeeId,
                _id: {
                    $ne: employeeId,
                },
            });

        if (existingEmployee) {
            throw new ApiError(
                409,
                "Employee ID already exists"
            );
        }
    }

    // =====================================================
    // DEPARTMENT VALIDATION
    // =====================================================

    if (employeeData.department) {

        if (
            !mongoose.Types.ObjectId.isValid(
                employeeData.department
            )
        ) {
            throw new ApiError(
                400,
                "Invalid department ID"
            );
        }

        const department =
            await Department.findById(
                employeeData.department
            );

        if (!department) {
            throw new ApiError(
                404,
                "Department not found"
            );
        }
    }

    // =====================================================
    // ROLE VALIDATION
    // =====================================================

    const allowedRoles = [
        "employee",
        "hr",
        "manager",
    ];

    if (
        employeeData.role &&
        !allowedRoles.includes(
            employeeData.role
        )
    ) {
        throw new ApiError(
            400,
            "Invalid employee role"
        );
    }

    // =====================================================
    // UPDATE BASIC FIELDS
    // =====================================================

    const allowedFields = [

        // Employee
        "employeeId",

        // Basic
        "firstName",
        "middleName",
        "lastName",
        "gender",
        "maritalStatus",
        "bloodGroup",
        "dateOfBirth",

        // Contact
        "personalEmail",
        "officialEmail",
        "mobile",
        "alternateMobile",

        "emergencyContactName",
        "emergencyContactNumber",

        "city",
        "state",
        "pinCode",

        "currentAddress",
        "permanentAddress",

        // Employment
        "role",
        "department",
        "designation",

        "employmentType",
        "workLocation",
        "joiningDate",
        "probationEndDate",

        "shiftFrom",
        "shiftTo",
        "workMode",
        "employmentStatus",

        // Payroll
        "basicSalary",
        "hraPercentage",
        "conveyanceAllowance",
        "specialAllowance",

        "epfPercentage",
        "professionalTaxPercentage",
        "tds",
        "employerPfPercentage",

        // Bank
        "bankName",
        "accountHolderName",
        "accountNumber",
        "ifscCode",
        "branch",
    ];

    allowedFields.forEach((field) => {

        if (
            employeeData[field] !==
            undefined
        ) {
            employee[field] =
                employeeData[field];
        }

    });

    // =====================================================
    // NORMALIZE EMAIL
    // =====================================================

    if (officialEmail) {
        employee.officialEmail =
            officialEmail;
    }

    if (employeeData.personalEmail) {
        employee.personalEmail =
            employeeData.personalEmail
                .trim()
                .toLowerCase();
    }

    // =====================================================
    // PAYROLL CALCULATION
    // =====================================================

    const basicSalary = Number(
        employeeData.basicSalary ??
        employee.basicSalary ??
        0
    );

    const hraPercentage = Number(
        employeeData.hraPercentage ??
        employee.hraPercentage ??
        0
    );

    const conveyanceAllowance = Number(
        employeeData.conveyanceAllowance ??
        employee.conveyanceAllowance ??
        0
    );

    const specialAllowance = Number(
        employeeData.specialAllowance ??
        employee.specialAllowance ??
        0
    );

    const epfPercentage = Number(
        employeeData.epfPercentage ??
        employee.epfPercentage ??
        0
    );

    const professionalTaxPercentage =
        Number(
            employeeData.professionalTaxPercentage ??
            employee.professionalTaxPercentage ??
            0
        );

    const tds = Number(
        employeeData.tds ??
        employee.tds ??
        0
    );

    const employerPfPercentage =
        Number(
            employeeData.employerPfPercentage ??
            employee.employerPfPercentage ??
            0
        );

    // =====================================================
    // HRA
    // =====================================================

    const hraAmount =
        (basicSalary * hraPercentage) / 100;

    // =====================================================
    // GROSS SALARY
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
        (grossSalary *
            professionalTaxPercentage) /
        100;

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
        grossSalary -
        totalDeductions,
        0
    );

    // =====================================================
    // EMPLOYER PF
    // =====================================================

    const employerPfAmount =
        (basicSalary *
            employerPfPercentage) /
        100;

    // =====================================================
    // CTC
    // =====================================================

    const ctc =
        grossSalary +
        employerPfAmount;

    // =====================================================
    // SAVE PAYROLL
    // =====================================================

    employee.basicSalary =
        basicSalary;

    employee.hraPercentage =
        hraPercentage;

    employee.hraAmount =
        hraAmount;

    employee.conveyanceAllowance =
        conveyanceAllowance;

    employee.specialAllowance =
        specialAllowance;

    employee.grossSalary =
        grossSalary;

    employee.epfPercentage =
        epfPercentage;

    employee.epfAmount =
        epfAmount;

    employee.professionalTaxPercentage =
        professionalTaxPercentage;

    employee.professionalTaxAmount =
        professionalTaxAmount;

    employee.tds =
        tds;

    employee.totalDeductions =
        totalDeductions;

    employee.netSalary =
        netSalary;

    employee.employerPfPercentage =
        employerPfPercentage;

    employee.employerPfAmount =
        employerPfAmount;

    employee.ctc =
        ctc;

    // =====================================================
    // EDUCATION
    // =====================================================

    if (
        educationList !== undefined
    ) {
        employee.educationList =
            educationList;
    }

    // =====================================================
    // EXPERIENCE
    // =====================================================

    if (
        experienceList !== undefined
    ) {
        employee.experienceList =
            experienceList;
    }

    // =====================================================
    // FILE UPLOADS
    //
    // IMPORTANT:
    // multer-storage-cloudinary already uploads
    // files to Cloudinary.
    //
    // file.path = Cloudinary URL
    // =====================================================

    if (Array.isArray(files)) {

        for (const file of files) {

            if (!file) {
                continue;
            }

            // =================================================
            // PROFILE PHOTO
            // =================================================

            if (
                file.fieldname ===
                "profilePhoto"
            ) {

                if (!file.path) {
                    throw new ApiError(
                        400,
                        "Profile photo upload failed"
                    );
                }

                employee.profilePhoto =
                    file.path;
            }

            // =================================================
            // BANK DOCUMENT
            // =================================================

            if (
                file.fieldname ===
                "bankDocument"
            ) {

                if (!file.path) {
                    throw new ApiError(
                        400,
                        "Bank document upload failed"
                    );
                }

                employee.bankDocument =
                    file.path;
            }

            // =================================================
            // EDUCATION DOCUMENT
            // =================================================

            if (
                file.fieldname.startsWith(
                    "educationDocuments_"
                )
            ) {

                const indexString =
                    file.fieldname.replace(
                        "educationDocuments_",
                        ""
                    );

                const index =
                    Number(indexString);

                if (
                    Number.isNaN(index) ||
                    !file.path
                ) {
                    continue;
                }

                if (
                    !employee.educationList[index]
                ) {
                    continue;
                }

                if (
                    !Array.isArray(
                        employee.educationList[
                            index
                        ].documents
                    )
                ) {
                    employee.educationList[
                        index
                    ].documents = [];
                }

                employee.educationList[
                    index
                ].documents.push(
                    file.path
                );
            }

            // =================================================
            // GENERAL DOCUMENTS
            // =================================================

            if (
                file.fieldname.startsWith(
                    "documents_"
                )
            ) {

                const documentType =
                    file.fieldname.replace(
                        "documents_",
                        ""
                    );

                if (!file.path) {
                    continue;
                }

                const currentDocuments =
                    employee.documents?.get(
                        documentType
                    ) || [];

                employee.documents.set(
                    documentType,
                    [
                        ...currentDocuments,
                        file.path,
                    ]
                );
            }
        }
    }

    // =====================================================
    // SAVE EMPLOYEE
    // =====================================================

    await employee.save();

    // =====================================================
    // FETCH UPDATED EMPLOYEE
    // =====================================================

    const updatedEmployee =
        await Employee
            .findById(employee._id)
            .select("-password");

    return updatedEmployee;
};

export default updateEmployeeService;