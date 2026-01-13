import fetch from "node-fetch";
import { OpenRouterProvider } from "../../src/llm/openrouter.provider";

const fetchMock = fetch as unknown as jest.Mock;

describe("OpenRouterProvider", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    process.env.OPENROUTER_MODEL = "test-model";
  });

  it("parses structured JSON responses", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                "```json\n" +
                JSON.stringify({
                  title: "כותרת",
                  interpretation: "פירוש",
                  categories: ["travel", "invalid"],
                  categoryScores: { travel: 0.7, invalid: 2 },
                }) +
                "\n```",
            },
          },
        ],
      }),
    });
    const provider = new OpenRouterProvider({ apiKey: "k" });
    const res = await provider.interpretDream("hi");
    expect(res.title).toBe("כותרת");
    expect(res.interpretation).toBe("פירוש");
    expect(res.categories).toEqual(["travel"]);
    expect(res.categoryScores).toEqual({ travel: 0.7 });
  });

  it("falls back to heuristic parsing when JSON is malformed", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Title: T\ninterpretation: I" } }],
      }),
    });
    const provider = new OpenRouterProvider({ apiKey: "k" });
    const res = await provider.interpretDream("hi");
    expect(res.title).toBe("T");
    expect(res.interpretation).toBe("I");
  });

  it("throws when no models are configured", async () => {
    delete process.env.OPENROUTER_MODEL;
    delete process.env.OPENROUTER_MODELS;
    const provider = new OpenRouterProvider({ apiKey: "k" });
    await expect(provider.interpretDream("hi")).rejects.toThrow(
      "No models configured"
    );
  });
});



