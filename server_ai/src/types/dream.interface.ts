import { Document, Types } from "mongoose";
import { DreamCategory } from "./categories.interface";
import type { DreamSymbolInsight } from "./dreamAnalysis.interface";
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
