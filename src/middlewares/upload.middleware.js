import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";

// =====================================================
// CLOUDINARY STORAGE
// =====================================================

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,

    params: async (req, file) => {

        // =================================================
        // PROFILE PHOTO
        // =================================================

        if (file.fieldname === "profilePhoto") {
            return {
                folder: "hrms/employees/profile-photos",

                allowed_formats: [
                    "jpg",
                    "jpeg",
                    "png",
                    "webp",
                ],

                transformation: [
                    {
                        width: 500,
                        height: 500,
                        crop: "fill",
                        gravity: "face",
                    },
                ],
            };
        }


        // =================================================
        // BANK DOCUMENT
        // =================================================

        if (file.fieldname === "bankDocument") {
            return {
                folder: "hrms/employees/bank-documents",

                resource_type: "auto",

                allowed_formats: [
                    "pdf",
                    "jpg",
                    "jpeg",
                    "png",
                ],
            };
        }


        // =================================================
        // EDUCATION DOCUMENTS
        // =================================================

        if (
            file.fieldname.startsWith(
                "educationDocuments_"
            )
        ) {
            return {
                folder: "hrms/employees/education-documents",

                resource_type: "auto",

                allowed_formats: [
                    "pdf",
                ],
            };
        }


        // =================================================
        // GENERAL EMPLOYEE DOCUMENTS
        // =================================================

        if (
            file.fieldname.startsWith(
                "documents_"
            )
        ) {
            return {
                folder: "hrms/employees/documents",

                resource_type: "auto",

                allowed_formats: [
                    "pdf",
                ],
            };
        }


        // =================================================
        // DEFAULT
        // =================================================

        return {
            folder: "hrms/employees",
            resource_type: "auto",
        };
    },
});


// =====================================================
// MULTER
// =====================================================

const employeeUpload = multer({

    storage,

    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },

});


// =====================================================
// EXPORT
// =====================================================

export default employeeUpload;