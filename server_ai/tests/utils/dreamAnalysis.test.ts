import {
  normalizeKeySymbols,
  normalizeStringList,
} from "../../src/utils/dreamAnalysis";

describe("dream analysis normalizers", () => {
  it("normalizes, deduplicates, and limits string lists", () => {
    expect(
      normalizeStringList(["  fear  ", "fear", "hope", "x".repeat(8)], {
        maxItems: 3,
        maxLength: 4,
      })
    ).toEqual(["fear", "hope", "xxxx"]);
  });

  it("normalizes key symbols from strings and objects", () => {
    expect(
      normalizeKeySymbols([
        " door ",
        { symbol: "water", meaning: "deep feeling" },
        { name: "path", description: "next step" },
        { symbol: "door", meaning: "duplicate" },
      ])
    ).toEqual([
      { symbol: "door", meaning: "" },
      { symbol: "water", meaning: "deep feeling" },
      { symbol: "path", meaning: "next step" },
    ]);
  });
});

