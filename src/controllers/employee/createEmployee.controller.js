// import createEmployeeService from "../../service/employee/createEmployee.service.js";

import createEmployeeService from "../../services/employee/createEmployee.service.js";

const createEmployeeController = async (req, res) => {
    try {

        // =====================================================
        // PARSE EDUCATION LIST
        // =====================================================

        let educationList = [];

        if (req.body.educationList) {
            try {
                educationList = JSON.parse(
                    req.body.educationList
                );
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "Invalid educationList JSON",
                    errors: [],
                });
            }
        }

        // =====================================================
        // PARSE EXPERIENCE LIST
        // =====================================================

        let experienceList = [];

        if (req.body.experienceList) {
            try {
                experienceList = JSON.parse(
                    req.body.experienceList
                );
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "Invalid experienceList JSON",
                    errors: [],
                });
            }
        }

        // =====================================================
        // CLOUDINARY FILE URL
        // =====================================================

        const getFileUrl = (file) => {
            return (
                file?.path ||
                file?.secure_url ||
                file?.url ||
                ""
            );
        };

        // =====================================================
        // PROFILE PHOTO
        // =====================================================

        const profilePhotoFile = req.files?.find(
            (file) =>
                file.fieldname === "profilePhoto"
        );

        if (!profilePhotoFile) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Profile photo is required",
                errors: [],
            });
        }

        const profilePhoto =
            getFileUrl(profilePhotoFile);

        // =====================================================
        // BANK DOCUMENT
        // =====================================================

        const bankDocumentFile = req.files?.find(
            (file) =>
                file.fieldname === "bankDocument"
        );

        if (!bankDocumentFile) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "Bank document is required",
                errors: [],
            });
        }

        const bankDocument =
            getFileUrl(bankDocumentFile);

        // =====================================================
        // EDUCATION DOCUMENTS
        //
        // educationDocuments_0
        // educationDocuments_1
        // educationDocuments_2
        // =====================================================

        educationList = educationList.map(
            (education, index) => {

                const educationFiles =
                    req.files?.filter(
                        (file) =>
                            file.fieldname ===
                            `educationDocuments_${index}`
                    ) || [];

                return {
                    ...education,

                    documents:
                        educationFiles.map(
                            getFileUrl
                        ),
                };
            }
        );

        // =====================================================
        // GENERAL DOCUMENTS
        //
        // documents_aadhaar
        // documents_pan
        // documents_resume
        // =====================================================

        const documents = {};

        req.files
            ?.filter(
                (file) =>
                    file.fieldname.startsWith(
                        "documents_"
                    )
            )
            .forEach((file) => {

                const key =
                    file.fieldname.replace(
                        "documents_",
                        ""
                    );

                if (!documents[key]) {
                    documents[key] = [];
                }

                documents[key].push(
                    getFileUrl(file)
                );
            });

        // =====================================================
        // FINAL EMPLOYEE DATA
        // =====================================================

        const employeeData = {
            ...req.body,

            profilePhoto,

            bankDocument,

            educationList,

            experienceList,

            documents,
        };

        // =====================================================
        // CREATE EMPLOYEE
        // =====================================================

        const employee =
            await createEmployeeService(
                employeeData
            );

        // =====================================================
        // SUCCESS RESPONSE
        // =====================================================

        return res.status(201).json({
            success: true,
            statusCode: 201,
            message:
                "Employee created successfully",
            data: {
                employee,
            },
        });

    } catch (error) {

        console.error(
            "Create Employee Error:",
            error
        );

        return res.status(400).json({
            success: false,
            statusCode: 400,
            message:
                error.message ||
                "Failed to create employee",
            errors: [],
        });
    }
};

export default createEmployeeController;