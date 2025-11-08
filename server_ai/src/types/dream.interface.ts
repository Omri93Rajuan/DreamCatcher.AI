import { Types } from "mongoose";
import { DreamCategory } from "./categories.interface";
export interface IDream extends Document {
    userId: Types.ObjectId;
    title: string;
    userInput: string;
    aiResponse: string;
    isShared: boolean;
    sharedAt?: Date | null;
    categories: DreamCategory[];
    categoryScores?: Record<string, number>;
    createdAt: Date;
    updatedAt: Date;
}
