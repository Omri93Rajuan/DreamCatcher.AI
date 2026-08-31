import { countWords } from "../../src/utils/countWords";

describe("countWords", () => {
  it("counts words rather than whitespace or punctuation", () => {
    expect(countWords("  I dreamed, I flew!  ")).toBe(4);
    expect(countWords("don't well-known")).toBe(2);
  });

  it("counts Hebrew words", () => {
    expect(countWords("חלמתי שאני עף מעל הים")).toBe(5);
  });
});
