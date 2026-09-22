import mongoose from "mongoose";

const connectToDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URL);

    console.log(`Database Connected : ${connection.connection.host}`);
  } catch (error) {
    console.error("Database Connection Error:", error.message);

    process.exit(1);
  }
};

export default connectToDb;
