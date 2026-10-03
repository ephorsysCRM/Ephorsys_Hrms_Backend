import mongoose from "mongoose";

// =====================================================
// EDUCATION SCHEMA
// =====================================================

const educationSchema = new mongoose.Schema(
    {
        qualification: {
            type: String,
            required: true,
            trim: true,
        },

        university: {
            type: String,
            required: true,
            trim: true,
        },

        passingYear: {
            type: Number,
            required: true,
            min: 1950,
            max: new Date().getFullYear(),
        },

        scoreType: {
            type: String,
            enum: ["percentage", "cgpa"],
            required: true,
        },

        score: {
            type: Number,
            required: true,
            min: 0,
        },

        specialization: {
            type: String,
            trim: true,
            default: "",
        },

        // Uploaded document URLs
        documents: {
            type: [String],
            default: [],
        },
    },
    {
        _id: true,
    }
);


// =====================================================
// EXPERIENCE SCHEMA
// =====================================================

const experienceSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            trim: true,
            default: "",
        },

        designation: {
            type: String,
            trim: true,
            default: "",
        },

        totalExperience: {
            type: String,
            trim: true,
            default: "",
        },

        skills: {
            type: String,
            trim: true,
            default: "",
        },

        startDate: {
            type: Date,
            default: null,
        },

        endDate: {
            type: Date,
            default: null,
        },

        reasonForLeaving: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        _id: true,
    }
);


// =====================================================
// EMPLOYEE SCHEMA
// =====================================================

const employeeSchema = new mongoose.Schema(
    {

        // =================================================
        // BASIC INFORMATION
        // =================================================

        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        middleName: {
            type: String,
            trim: true,
            default: "",
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            required: true,
        },

        maritalStatus: {
            type: String,
            enum: [
                "Single",
                "Married",
                "Divorced",
                "Widowed",
            ],
            required: true,
        },

        bloodGroup: {
            type: String,
            enum: [
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-",
            ],
            required: true,
        },

        dateOfBirth: {
            type: Date,
            required: true,
        },

        profilePhoto: {
            type: String,
            required: true,
            trim: true,
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


        // =================================================
        // CONTACT INFORMATION
        // =================================================

        personalEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        officialEmail: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        mobile: {
            type: String,
            required: true,
            trim: true,
            match: [
                /^[0-9]{10}$/,
                "Mobile number must be 10 digits",
            ],
        },

        alternateMobile: {
            type: String,
            trim: true,
            default: "",
            match: [
                /^$|^[0-9]{10}$/,
                "Alternate mobile number must be 10 digits",
            ],
        },

        emergencyContactName: {
            type: String,
            trim: true,
            default: "",
        },

        emergencyContactNumber: {
            type: String,
            trim: true,
            default: "",
            match: [
                /^$|^[0-9]{10}$/,
                "Emergency contact number must be 10 digits",
            ],
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        state: {
            type: String,
            required: true,
            trim: true,
        },

        pinCode: {
            type: String,
            required: true,
            trim: true,
            match: [
                /^[0-9]{6}$/,
                "PIN code must be 6 digits",
            ],
        },

        currentAddress: {
            type: String,
            required: true,
            trim: true,
        },

        permanentAddress: {
            type: String,
            required: true,
            trim: true,
        },


        // =================================================
        // JOB INFORMATION
        // =================================================

        role: {
            type: String,
            enum: [
                "employee",
                "hr",
                "manager",
            ],
            default: "employee",
            required: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },

        designation: {
            type: String,
            required: true,
            trim: true,
        },

        employmentType: {
            type: String,
            enum: [
                "full_time",
                "part_time",
                "intern",
                "freelancer",
                "contract",
            ],
            required: true,
        },

        workLocation: {
            type: String,
            required: true,
            trim: true,
        },

        joiningDate: {
            type: Date,
            required: true,
        },

        probationEndDate: {
            type: Date,
            default: null,
        },

        shiftFrom: {
            type: String,
            default: "",
            match: [
                /^$|^([01]\d|2[0-3]):[0-5]\d$/,
                "Invalid shift start time",
            ],
        },

        shiftTo: {
            type: String,
            default: "",
            match: [
                /^$|^([01]\d|2[0-3]):[0-5]\d$/,
                "Invalid shift end time",
            ],
        },

        workMode: {
            type: String,
            enum: [
                "remote",
                "hybrid",
                "office",
            ],
            required: true,
        },

        employmentStatus: {
            type: String,
            enum: [
                "active",
                "notice_period",
                "resigned",
                "terminated",
            ],
            required: true,
            default: "active",
        },

        departmentHead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null,
        },


        // =================================================
        // PAYROLL INFORMATION
        // =================================================

        basicSalary: {
            type: Number,
            required: true,
            min: 0,
        },

        hraPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },

        hraAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        conveyanceAllowance: {
            type: Number,
            default: 0,
            min: 0,
        },

        specialAllowance: {
            type: Number,
            default: 0,
            min: 0,
        },

        grossSalary: {
            type: Number,
            default: 0,
            min: 0,
        },

        epfPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        epfAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        professionalTaxPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        professionalTaxAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        tds: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalDeductions: {
            type: Number,
            default: 0,
            min: 0,
        },

        netSalary: {
            type: Number,
            default: 0,
            min: 0,
        },

        employerPfPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        employerPfAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        ctc: {
            type: Number,
            default: 0,
            min: 0,
        },


        // =================================================
        // BANK INFORMATION
        // =================================================

        bankName: {
            type: String,
            required: true,
            trim: true,
        },

        accountHolderName: {
            type: String,
            required: true,
            trim: true,
        },

        accountNumber: {
            type: String,
            required: true,
            trim: true,
        },

        ifscCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        branch: {
            type: String,
            required: true,
            trim: true,
        },

        bankDocument: {
            type: String,
            required: true,
            trim: true,
        },


        // =================================================
        // EDUCATION DETAILS
        // =================================================

        educationList: {
            type: [educationSchema],
            default: [],
        },


        // =================================================
        // EXPERIENCE DETAILS
        // =================================================

        experienceList: {
            type: [experienceSchema],
            default: [],
        },


        // =================================================
        // GENERAL EMPLOYEE DOCUMENTS
        //
        // Example:
        //
        // documents: {
        //     aadhaar: ["url1"],
        //     pan: ["url2"],
        //     resume: ["url3"]
        // }
        // =================================================

        documents: {
            type: Map,
            of: [String],
            default: {},
        },
    },
    {
        timestamps: true,
    }
);


// =====================================================
// EDUCATION SCORE VALIDATION
// =====================================================

employeeSchema.path("educationList").validate(
    function (educationList) {

        for (const education of educationList) {

            if (
                education.scoreType === "percentage" &&
                education.score > 100
            ) {
                return false;
            }

            if (
                education.scoreType === "cgpa" &&
                education.score > 10
            ) {
                return false;
            }
        }

        return true;
    },
    "Invalid education score"
);


// =====================================================
// EXPORT MODEL
// =====================================================

const Employee = mongoose.model(
    "Employee",
    employeeSchema
);

export default Employee;