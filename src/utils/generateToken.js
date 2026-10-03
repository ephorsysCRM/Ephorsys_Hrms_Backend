import jwt from "jsonwebtoken";

const generateToken = (admin) => {
    return jwt.sign(
        {
            id: admin._id.toString(),
            role: admin.role,
            email: admin.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        }
    );
};

export default generateToken;