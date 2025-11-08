"use client";
import run from "@/assets/article_images/run.webp";
import falling from "@/assets/article_images/falling.webp";
import fallT from "@/assets/article_images/fallT.webp";
import fly from "@/assets/article_images/fly.webp";
import galaxyShirt from "@/assets/article_images/galaxy-shirt.webp";
import house from "@/assets/article_images/house.webp";
import snake from "@/assets/article_images/snake.webp";
import starlitCradle from "@/assets/article_images/starlit-cradle.webp";
import water from "@/assets/article_images/water.webp";
import dead from "@/assets/article_images/dead.webp";
import deadman from "@/assets/article_images/deadman.webp";
import test from "@/assets/article_images/test.webp";

const COVER_MAP: Record<string, string> = {
  "article_images/run.webp": run,
  "article_images/falling.webp": falling,
  "article_images/fallT.webp": fallT,
  "article_images/fly.webp": fly,
  "article_images/galaxy-shirt.webp": galaxyShirt,
  "article_images/house.webp": house,
  "article_images/moonlit-snake.webp": snake,
  "article_images/snake.webp": snake,
  "article_images/starlit-cradle.webp": starlitCradle,
  "article_images/water.webp": water,
  "article_images/dead.webp": dead,
  "article_images/deadman.webp": deadman,
  "article_images/test.webp": test,
};

export function resolveArticleCover(src?: string): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  return COVER_MAP[src] ?? src;
}

export function hasLocalCover(src?: string): boolean {
  if (!src) return false;
  return !/^https?:\/\//i.test(src) && src in COVER_MAP;
}
