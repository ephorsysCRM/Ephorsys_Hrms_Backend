import bcrypt from "bcrypt";

const hashEmployeePasswordService = async (password) => {
    if (!password) {
        throw new Error("Employee password is required");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return hashedPassword;
};

export default hashEmployeePasswordService;