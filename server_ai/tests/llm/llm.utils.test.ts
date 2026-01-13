import { stripFences, tryParseJsonLike } from "../../src/llm/llm.utils";

describe("llm utils", () => {
  it("strips fenced JSON blocks", () => {
    const fenced = "```json\n{\"a\":1}\n```";
    expect(stripFences(fenced)).toBe('{"a":1}');
  });

  it("strips a leading json label", () => {
    expect(stripFences("json   {\"a\":1}")).toBe('{"a":1}');
  });

  it("parses valid json-like strings", () => {
    const parsed = tryParseJsonLike('{"a":"b"}');
    expect(parsed).toEqual({ a: "b" });
  });

  it("returns null for non-json payloads", () => {
    expect(tryParseJsonLike("not-json")).toBeNull();
  });
});



