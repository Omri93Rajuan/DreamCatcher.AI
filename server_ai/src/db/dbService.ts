import chalk from "chalk";
import mongoose from "mongoose";
const ENVIRONMENT = process.env.NODE_ENV || "development";

const connectToDb = async (): Promise<void> => {
  try {
    const uri =
      ENVIRONMENT === "production"
        ? process.env.MONGO_URI_ATLAS
        : process.env.MONGO_URI_LOCAL;
    if (!uri) {
      throw new Error(
        "MongoDB connection string is missing in environment variables"
      );
    }
    await mongoose.connect(uri);
    console.log(chalk.yellow.bold(`Connected to MongoDB (${ENVIRONMENT}) `));
  } catch (error) {
    console.error(chalk.bgRed.white.bold("MongoDB connection failed: "), error);
    process.exit(1);
  }
};
export default connectToDb;
