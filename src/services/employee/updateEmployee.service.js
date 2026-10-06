import mongoose from "mongoose";
import bcrypt from "bcryptjs";


import ApiError from "../../utils/ApiError.js";
import Employee from "../../model/employee.model.js";
import Department from "../../model/department.model.js";


const updateEmployeeService = async (
    employeeId,
    employeeData,
    files = []
) => {

    // ==========================================
    // VALIDATE EMPLOYEE ID
    // ==========================================

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        throw new ApiError(
            400,
            "Invalid employee ID"
        );
    }


    // ==========================================
    // FIND EMPLOYEE
    // ==========================================

    const employee = await Employee.findById(
        employeeId
    );

    if (!employee) {
        throw new ApiError(
            404,
            "Employee not found"
        );
    }


    // ==========================================
    // PARSE JSON FIELDS
    // ==========================================

    let educationList = employeeData.educationList;
    let experienceList = employeeData.experienceList;


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


    // ==========================================
    // OFFICIAL EMAIL DUPLICATE CHECK
    // ==========================================

    if (
        employeeData.officialEmail &&
        employeeData.officialEmail !==
        employee.officialEmail
    ) {

        const existingEmployee =
            await Employee.findOne({
                officialEmail:
                    employeeData.officialEmail,
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


    // ==========================================
    // EMPLOYEE ID DUPLICATE CHECK
    // ==========================================

    if (
        employeeData.employeeId &&
        employeeData.employeeId !==
        employee.employeeId
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


    // ==========================================
    // DEPARTMENT VALIDATION
    // ==========================================

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


    // ==========================================
    // ALLOWED ROLES
    // ==========================================

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


    // ==========================================
    // UPDATE BASIC FIELDS
    // ==========================================

    const allowedFields = [
        "employeeId",

        "firstName",
        "middleName",
        "lastName",

        "gender",
        "maritalStatus",
        "bloodGroup",
        "dateOfBirth",

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

        "basicSalary",
        "hraPercentage",
        "hraAmount",

        "conveyanceAllowance",
        "specialAllowance",

        "grossSalary",

        "epfPercentage",
        "epfAmount",

        "professionalTaxPercentage",
        "professionalTaxAmount",

        "tds",
        "totalDeductions",
        "netSalary",

        "employerPfPercentage",
        "employerPfAmount",

        "ctc",

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


    // ==========================================
    // EDUCATION
    // ==========================================

    if (
        educationList !== undefined
    ) {
        employee.educationList =
            educationList;
    }


    // ==========================================
    // EXPERIENCE
    // ==========================================

    if (
        experienceList !== undefined
    ) {
        employee.experienceList =
            experienceList;
    }


    // ==========================================
    // FILE UPLOADS
    // ==========================================

    if (Array.isArray(files)) {

        for (const file of files) {

            if (!file) continue;


            // ----------------------------------
            // PROFILE PHOTO
            // ----------------------------------

            if (
                file.fieldname ===
                "profilePhoto"
            ) {

                // Replace this with your
                // existing Cloudinary upload
                // implementation.

                // employee.profilePhoto =
                //     uploadedUrl;
            }


            // ----------------------------------
            // BANK DOCUMENT
            // ----------------------------------

            if (
                file.fieldname ===
                "bankDocument"
            ) {

                // Replace this with your
                // existing Cloudinary upload
                // implementation.

                // employee.bankDocument =
                //     uploadedUrl;
            }


            // ----------------------------------
            // EDUCATION DOCUMENTS
            // ----------------------------------

            if (
                file.fieldname.startsWith(
                    "educationDocuments_"
                )
            ) {

                // Handle education document
                // upload here.
            }


            // ----------------------------------
            // GENERAL DOCUMENTS
            // ----------------------------------

            if (
                file.fieldname.startsWith(
                    "documents_"
                )
            ) {

                // Handle general documents
                // upload here.
            }
        }
    }


    // ==========================================
    // SAVE EMPLOYEE
    // ==========================================

    await employee.save();


    // ==========================================
    // REMOVE PASSWORD FROM RESPONSE
    // ==========================================

    const updatedEmployee =
        await Employee.findById(
            employee._id
        ).select("-password");


    return updatedEmployee;
};


export default updateEmployeeService;