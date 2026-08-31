const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;

export function countWords(value: string): number {
  return value.match(WORD_PATTERN)?.length ?? 0;
}
