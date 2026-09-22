import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Admin name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },

        phone: {
            type: String,
            trim: true,
            default: null,
        },

        profileImage: {
            type: String,
            default: null,
        },

        role: {
            type: String,
            enum: ["super_admin", "admin"],
            default: "admin",
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isBlocked: {
            type: Boolean,
            default: false,
        },

        refreshToken: {
            type: String,
            default: null,
            select: false,
        },

        tokenVersion: {
            type: Number,
            default: 0,
        },

        lastLogin: {
            type: Date,
            default: null,
        },
        resetPasswordOtp: {
            type: String,
            default: null,
            select: false,
        },

        resetPasswordOtpExpires: {
            type: Date,
            default: null,
            select: false,
        },

        resetPasswordVerified: {
            type: Boolean,
            default: false,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;