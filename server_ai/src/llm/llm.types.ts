import { DreamCategory } from "../types/categories.interface";

export type LLMResult = {
  title?: string;
  interpretation: string;
  categories?: DreamCategory[]; // ⬅️ חדש
  categoryScores?: Record<DreamCategory, number>; // ⬅️ אופציונלי
};

export interface LLMOptions {
  modelOverride?: string;
}
export interface LLMProvider {
  interpretDream(userInput: string, options?: LLMOptions): Promise<LLMResult>;
}
