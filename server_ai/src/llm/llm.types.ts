export type LLMResult = { title?: string; interpretation: string };

export interface LLMOptions {
  modelOverride?: string;
}

export interface LLMProvider {
  interpretDream(userInput: string, options?: LLMOptions): Promise<LLMResult>;
}
