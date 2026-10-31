
import mongoose from "mongoose";

const officeLocationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        address: {
            type: String,
            trim: true,
            default: "",
        },

        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90,
        },

        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180,
        },

        radiusInMeters: {
            type: Number,
            default: 100,
            min: 1,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const OfficeLocation = mongoose.model(
    "OfficeLocation",
    officeLocationSchema
);

export default OfficeLocation;
