import { DreamCategory } from "../types/categories.interface";
export type DreamSymbolInsight = {
  symbol: string;
  meaning: string;
};
export type LLMResult = {
  title?: string;
  interpretation: string;
  insights?: string[];
  keySymbols?: DreamSymbolInsight[];
  emotions?: string[];
  categories?: DreamCategory[];
  categoryScores?: Record<DreamCategory, number>;
};
export interface LLMOptions {
  modelOverride?: string;
}
export interface LLMProvider {
  interpretDream(userInput: string, options?: LLMOptions): Promise<LLMResult>;
}
