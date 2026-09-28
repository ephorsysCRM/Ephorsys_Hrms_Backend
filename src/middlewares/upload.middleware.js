import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";

// =====================================================
// CLOUDINARY STORAGE
// =====================================================

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,

    params: {
        folder: "hrms/admin-profiles",

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
    },
});

// =====================================================
// MULTER
// =====================================================

const uploadToCloudinary = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
});

export default uploadToCloudinary;