import jwt from "jsonwebtoken";

const generateToken = (user) => {
    if (!user) {
        throw new Error("Cannot generate token: user is missing");
    }

    const userId = user._id || user.id;

    if (!userId) {
        throw new Error("Cannot generate token: user ID is missing");
    }

    return jwt.sign(
        {
            id: userId.toString(),
            role: user.role,
            email: user.email || user.officialEmail,
            userType: user.userType,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        }
    );
};

export default generateToken;