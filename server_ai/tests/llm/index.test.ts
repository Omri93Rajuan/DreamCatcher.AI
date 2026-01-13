describe("llm index", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("throws when API key is missing", () => {
    const prev = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    const { getLLMProvider } = require("../../src/llm/index");
    expect(() => getLLMProvider()).toThrow("Missing OPENROUTER_API_KEY");
    process.env.OPENROUTER_API_KEY = prev;
  });

  it("returns a cached provider instance", () => {
    process.env.OPENROUTER_API_KEY = "k";
    process.env.OPENROUTER_MODEL = "test-model";
    const { getLLMProvider } = require("../../src/llm/index");
    const first = getLLMProvider();
    const second = getLLMProvider();
    expect(first).toBe(second);
  });
});



