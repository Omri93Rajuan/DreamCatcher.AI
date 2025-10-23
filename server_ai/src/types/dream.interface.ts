import { Types } from "mongoose";

export interface IDream extends Document {
  userId: Types.ObjectId;
  title: string;
  userInput: string;
  aiResponse: string;
  isShared: boolean;
  sharedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
