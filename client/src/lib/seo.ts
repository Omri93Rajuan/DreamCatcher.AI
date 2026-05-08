import articlesData from "@/components/articles/articlesData.json";
import { resolveArticleCover } from "@/components/articles/coverImages";
import logoUrl from "@/assets/logo.webp";
import type { Article } from "@/lib/api/types";
import { stripMarkdown } from "@/lib/utils/articlesUtils";
import { getArticleSeoEnhancement } from "@/lib/articleSeoEnhancements";

export const SITE_URL = "https://dreamaicatcher.com";
export const SITE_NAME = "DreamCatcher.AI";
const JEWISH_DREAM_KEYWORDS = [
  "פירוש חלומות לפי היהדות",
  "פתרון חלומות לפי היהדות",
  "פירוש חלומות ביהדות",
  "חלום לפי היהדות",
  "פענוח חלומות",
  "משמעות חלומות",
  "חלומות ביהדות",
  "בינה מלאכותית לחלומות",
];

export type SeoDescriptor = {
  title: string;
  description: string;
  canonical: string;
  keywords?: string[];
  robots?: string;
  openGraph?: Record<string, string | undefined>;
  twitter?: Record<string, string | undefined>;
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

function uniqueStrings(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
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
  const image = absoluteUrl(logoUrl);
  const title = `פירוש חלומות לפי היהדות עם AI | ${SITE_NAME}`;
  const description =
    "DreamCatcher.AI מציע פירוש חלומות לפי היהדות בעברית, עם AI שמזהה סמלים, רגשות ותובנות אישיות בהשראת המסורת היהודית.";

  return {
    title,
    description,
    canonical,
    keywords: JEWISH_DREAM_KEYWORDS,
    robots: "index, follow",
    openGraph: {
      "og:title": title,
      "og:description": description,
      "og:type": "website",
      "og:url": canonical,
      "og:site_name": SITE_NAME,
      "og:locale": "he_IL",
      "og:image": image,
      "og:image:alt": "DreamCatcher.AI - פירוש חלומות לפי היהדות",
    },
    twitter: {
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": image,
    },
    jsonLd: createHomeJsonLd(canonical, description, image),
  };
}

export function getArticlesSeo(): SeoDescriptor {
  const canonical = absoluteUrl("/articles");
  const image = absoluteUrl(logoUrl);
  const title = `מאמרים על פירוש חלומות לפי היהדות | ${SITE_NAME}`;
  const description =
    "מאמרים על פירוש חלומות לפי היהדות, סמלים חוזרים, קבלה, חז\"ל, מדע השינה ותובנות מעשיות להתבוננות אחרי החלום.";

  return {
    title,
    description,
    canonical,
    keywords: [
      ...JEWISH_DREAM_KEYWORDS,
      "מאמרים על חלומות",
      "סמלים בחלומות לפי היהדות",
    ],
    robots: "index, follow",
    openGraph: {
      "og:title": title,
      "og:description": description,
      "og:type": "website",
      "og:url": canonical,
      "og:site_name": SITE_NAME,
      "og:locale": "he_IL",
      "og:image": image,
    },
    twitter: {
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": image,
    },
  };
}

export function getArticleDescription(article: Article) {
  const enhancement = getArticleSeoEnhancement(article.id);
  if (enhancement?.metaDescription) return enhancement.metaDescription;
  return cleanDescription(article.excerpt || article.content);
}

export function getArticleSeo(article: Article): SeoDescriptor {
  const enhancement = getArticleSeoEnhancement(article.id);
  const canonical = getArticleCanonical(article);
  const description = getArticleDescription(article);
  const image = getArticleImageUrl(article);
  const modifiedAt = article.modifiedAt || article.updatedAt;
  const title = enhancement?.metaTitle || article.title;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    canonical,
    keywords: [
      ...(enhancement
        ? [enhancement.focusKeyword, ...enhancement.searchPhrases]
        : []),
      ...(article.tags || []),
      "פירוש חלומות לפי היהדות",
      "חלומות ביהדות",
    ],
    robots: "index, follow",
    openGraph: {
      "og:title": title,
      "og:description": description,
      "og:image": image,
      "og:type": "article",
      "og:url": canonical,
      "og:site_name": SITE_NAME,
      "og:locale": "he_IL",
      "article:published_time": article.publishedAt,
      "article:modified_time": modifiedAt,
    },
    twitter: {
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": image,
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
  const enhancement = getArticleSeoEnhancement(article.id);
  const articleSchema = {
    "@type": "Article",
    headline: article.title,
    description,
    keywords: [
      ...(article.tags || []),
      ...(enhancement
        ? [enhancement.focusKeyword, ...enhancement.searchPhrases]
        : []),
    ],
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

  if (!enhancement?.faqs?.length) {
    return {
      "@context": "https://schema.org",
      ...articleSchema,
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      articleSchema,
      {
        "@type": "FAQPage",
        mainEntity: enhancement.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };
}

function createHomeJsonLd(canonical: string, description: string, image: string) {
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_NAME,
        alternateName: "פירוש חלומות לפי היהדות",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl(logoUrl),
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE_NAME,
        alternateName: "פירוש חלומות לפי היהדות",
        url: SITE_URL,
        description,
        inLanguage: ["he-IL", "en"],
        publisher: {
          "@id": organizationId,
        },
      },
      {
        "@type": "WebApplication",
        name: SITE_NAME,
        alternateName: "פירוש חלומות לפי היהדות",
        url: canonical,
        image,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        inLanguage: "he-IL",
        description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "ILS",
        },
      },
    ],
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
    ...(seo.keywords?.length
      ? [
          `<meta name="keywords" content="${escapeHtml(
            uniqueStrings(seo.keywords).join(", "),
          )}" />`,
        ]
      : []),
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

  for (const [name, content] of Object.entries(seo.twitter || {})) {
    if (!content) continue;
    tags.push(
      `<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}" />`,
    );
  }

  if (seo.jsonLd) {
    tags.push(
      `<script type="application/ld+json">${jsonLdText(seo.jsonLd)}</script>`,
    );
  }

  return tags.join("\n    ");
}
