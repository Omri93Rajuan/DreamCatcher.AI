import mongoose from "mongoose";
import chalk from "chalk";
import User from "../models/user";
const ENVIRONMENT = process.env.NODE_ENV || "development";
const GOOGLE_ID_INDEX_NAME = "googleId_1";
const ensureGoogleIdIndex = async (): Promise<void> => {
    try {
        const indexes = await User.collection.indexes();
        if (indexes.some((idx) => idx.name === GOOGLE_ID_INDEX_NAME)) {
            await User.collection.dropIndex(GOOGLE_ID_INDEX_NAME);
        }
    }
    catch (error) {
        const codeName = (error as { codeName?: string }).codeName;
        if (codeName && codeName !== "IndexNotFound") {
            console.warn(chalk.yellow(`Skipping drop of ${GOOGLE_ID_INDEX_NAME}: ${codeName}`));
        }
    }
    await User.collection.createIndex({ googleId: 1 }, {
        name: GOOGLE_ID_INDEX_NAME,
        unique: true,
        partialFilterExpression: {
            googleId: { $exists: true, $ne: null, $type: "string" },
        },
    });
};

const connectToDb = async (): Promise<void> => {
    try {
        const uri = ENVIRONMENT === "production"
            ? process.env.MONGO_URI_ATLAS
            : process.env.MONGO_URI_LOCAL;
        if (!uri) {
            throw new Error("MongoDB connection string is missing in environment variables");
        }
        await mongoose.connect(uri);
        await ensureGoogleIdIndex();
        console.log(chalk.yellow.bold(`Connected to MongoDB (${ENVIRONMENT}) `));
    }
    catch (error) {
        console.error(chalk.bgRed.white.bold("MongoDB connection failed: "), error);
        process.exit(1);
    }
};
export default connectToDb;
