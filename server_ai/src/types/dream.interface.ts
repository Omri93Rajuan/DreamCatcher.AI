import { Document, Types } from "mongoose";
import { DreamCategory } from "./categories.interface";
export interface DreamSymbolInsight {
  symbol: string;
  meaning: string;
}
export interface IDream extends Document {
  userId: Types.ObjectId;
  title: string;
  userInput: string;
  aiResponse: string;
  insights: string[];
  keySymbols: DreamSymbolInsight[];
  emotions: string[];
  isShared: boolean;
  sharedAt?: Date | null;
  categories: DreamCategory[];
  categoryScores?: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}
