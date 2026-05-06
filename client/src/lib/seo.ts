import articlesData from "@/components/articles/articlesData.json";
import { resolveArticleCover } from "@/components/articles/coverImages";
import logoUrl from "@/assets/logo.webp";
import type { Article } from "@/lib/api/types";
import { stripMarkdown } from "@/lib/utils/articlesUtils";

export const SITE_URL = "https://dreamaicatcher.com";
export const SITE_NAME = "DreamCatcher.AI";

export type SeoDescriptor = {
  title: string;
  description: string;
  canonical: string;
  robots?: string;
  openGraph?: Record<string, string | undefined>;
  jsonLd?: unknown;
};

export const allArticles = articlesData as Article[];

function cleanDescription(text: string, maxLength = 160) {
  const clean = stripMarkdown(text).replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 3).trim()}...`;
}

function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`, SITE_URL)
    .href;
}

export function getArticleSlug(article: Article) {
  return article.slug || article.id;
}

export function getArticleBySlug(slug?: string) {
  if (!slug) return undefined;
  return allArticles.find((article) => getArticleSlug(article) === slug);
}

export function getArticlePath(article: Article) {
  return `/articles/${getArticleSlug(article)}`;
}

export function getArticleCanonical(article: Article) {
  return absoluteUrl(getArticlePath(article));
}

export function getArticleImageUrl(article?: Article) {
  const src = article?.coverUrl ? resolveArticleCover(article.coverUrl) : logoUrl;
  return absoluteUrl(src || logoUrl);
}

export function getHomeSeo(): SeoDescriptor {
  const canonical = absoluteUrl("/");
  const description =
    "Decode dreams with AI-assisted interpretation, symbols, emotions, and personal insights from DreamCatcher.AI.";

  return {
    title: "Dream AI Catcher - AI Dream Interpretation",
    description,
    canonical,
    robots: "index, follow",
    openGraph: {
      "og:title": "Dream AI Catcher - AI Dream Interpretation",
      "og:description": description,
      "og:type": "website",
      "og:url": canonical,
      "og:site_name": SITE_NAME,
      "og:image": absoluteUrl(logoUrl),
    },
  };
}

export function getArticlesSeo(): SeoDescriptor {
  const canonical = absoluteUrl("/articles");
  const description =
    "Read DreamCatcher.AI articles about recurring dream symbols, spiritual meaning, sleep science, and practical reflection.";

  return {
    title: `Dream Articles | ${SITE_NAME}`,
    description,
    canonical,
    robots: "index, follow",
    openGraph: {
      "og:title": `Dream Articles | ${SITE_NAME}`,
      "og:description": description,
      "og:type": "website",
      "og:url": canonical,
      "og:site_name": SITE_NAME,
      "og:image": absoluteUrl(logoUrl),
    },
  };
}

export function getArticleDescription(article: Article) {
  return cleanDescription(article.excerpt || article.content);
}

export function getArticleSeo(article: Article): SeoDescriptor {
  const canonical = getArticleCanonical(article);
  const description = getArticleDescription(article);
  const image = getArticleImageUrl(article);
  const modifiedAt = article.modifiedAt || article.updatedAt;

  return {
    title: `${article.title} | ${SITE_NAME}`,
    description,
    canonical,
    robots: "index, follow",
    openGraph: {
      "og:title": article.title,
      "og:description": description,
      "og:image": image,
      "og:type": "article",
      "og:url": canonical,
      "og:site_name": SITE_NAME,
      "article:published_time": article.publishedAt,
      "article:modified_time": modifiedAt,
    },
    jsonLd: createArticleJsonLd(article, description, image, canonical),
  };
}

export function getSeoForPath(pathname: string): SeoDescriptor {
  const path = new URL(pathname, SITE_URL).pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return getHomeSeo();
  if (path === "/articles") return getArticlesSeo();
  if (path.startsWith("/articles/")) {
    const slug = decodeURIComponent(path.replace("/articles/", ""));
    const article = getArticleBySlug(slug);
    if (article) return getArticleSeo(article);
  }
  return getHomeSeo();
}

export function getRelatedArticles(article: Article, limit = 3) {
  const tags = new Set(article.tags || []);
  const scored = allArticles
    .filter((candidate) => candidate.id !== article.id)
    .map((candidate) => ({
      article: candidate,
      score: (candidate.tags || []).filter((tag) => tags.has(tag)).length,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        Date.parse(b.article.publishedAt || "") -
        Date.parse(a.article.publishedAt || "")
      );
    });

  return scored.slice(0, limit).map((entry) => entry.article);
}

function createArticleJsonLd(
  article: Article,
  description: string,
  image: string,
  canonical: string,
) {
  const modifiedAt = article.modifiedAt || article.updatedAt;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description,
    image: [image],
    datePublished: article.publishedAt,
    ...(modifiedAt ? { dateModified: modifiedAt } : {}),
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(logoUrl),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonLdText(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function renderSeoHead(seo: SeoDescriptor) {
  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="robots" content="${escapeHtml(seo.robots || "index, follow")}" />`,
    `<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];

  for (const [property, content] of Object.entries(seo.openGraph || {})) {
    if (!content) continue;
    tags.push(
      `<meta property="${escapeHtml(property)}" content="${escapeHtml(content)}" />`,
    );
  }

  if (seo.jsonLd) {
    tags.push(
      `<script type="application/ld+json">${jsonLdText(seo.jsonLd)}</script>`,
    );
  }

  return tags.join("\n    ");
}
