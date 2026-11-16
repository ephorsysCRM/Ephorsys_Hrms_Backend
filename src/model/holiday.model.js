
import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        date: {
            type: Date,
            required: true,
        },

        year: {
            type: Number,
            required: true,
            index: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "createdByType",
        },

        createdByType: {
            type: String,
            enum: ["Admin", "Employee"],
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// One holiday per date
holidaySchema.index(
    { date: 1 },
    { unique: true }
);

// Get active holidays by year
holidaySchema.index({
    year: 1,
    isActive: 1,
});

const Holiday = mongoose.model(
    "Holiday",
    holidaySchema
);

export default Holiday;
