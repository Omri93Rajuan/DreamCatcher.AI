import { LLMProvider } from "./llm.types";
import { OpenRouterProvider } from "./openrouter.provider";
let currentProvider: LLMProvider | null = null;
export function getLLMProvider(): LLMProvider {
    if (currentProvider)
        return currentProvider;
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey)
        throw new Error("Missing OPENROUTER_API_KEY");
    currentProvider = new OpenRouterProvider({ apiKey });
    return currentProvider;
}
export function setLLMProvider(provider: LLMProvider) {
    currentProvider = provider;
}
